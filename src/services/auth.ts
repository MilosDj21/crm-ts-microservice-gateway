import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import { kafka } from "../kafkaClient";
import { v4 as uuidv4 } from "uuid";

import {
  GatewayTimeoutError,
  UnauthorizedError,
} from "../middlewares/CustomError";

class AuthService {
  private producer;
  private consumer;
  private requestTopic;
  private responseTopic;
  private pendingRequests;

  constructor() {
    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: "auth-service-group" });
    this.requestTopic = "user-requests";
    this.responseTopic = "user-responses";
    this.pendingRequests = new Map();
  }

  private createJwt(id: number) {
    //3 days in seconds
    const maxAge = 3 * 24 * 60 * 60;
    const secret = process.env.JWT_SECRET;
    if (secret) {
      return jwt.sign({ id }, secret, {
        expiresIn: maxAge,
      });
    } else {
      return null;
    }
  }

  async login(email: string, password: string, twoFaToken: string) {
    const user = await this.getUserData(email);
    if (!user)
      throw new UnauthorizedError(
        "Credentials not correct",
        "Email is not correct",
      );

    const auth = await bcrypt.compare(password, user.password);
    if (!auth)
      throw new UnauthorizedError(
        "Credentials not correct",
        "Passwords dont match",
      );

    const twoFAValid = authenticator.verify({
      token: twoFaToken,
      secret: user.secret,
    });
    if (!twoFAValid)
      throw new UnauthorizedError(
        "Credentials not correct",
        "Two FA not valid",
      );

    const jwtToken = this.createJwt(user.id);
    if (!jwtToken) throw new Error("Creating jwt failed");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      jwtToken,
    };
  }

  private async getUserData(email: string) {
    const correlationId = uuidv4();

    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.responseTopic,
      fromBeginning: false,
    });

    // Set up a promise and store its resolve and reject methods
    const responsePromise = new Promise((resolve, reject) => {
      // Create a timeout for the response
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(
          new GatewayTimeoutError(
            "Gateway Timeout",
            "Retrieving users data failed",
          ),
        );
      }, 10000);

      // Store the pending request in the map
      this.pendingRequests.set(correlationId, { resolve, reject, timeout });
    });

    // Run the consumer to check for matching responses
    this.consumer.run({
      eachMessage: async ({ message }) => {
        if (
          message.headers &&
          message.headers["correlationId"] &&
          message.headers["correlationId"].toString() === correlationId
        ) {
          // If a matching pending request exists, resolve it
          if (this.pendingRequests.has(correlationId) && message.value) {
            const { resolve, timeout } =
              this.pendingRequests.get(correlationId);
            clearTimeout(timeout);
            this.pendingRequests.delete(correlationId);
            resolve(message.value.toString());
          }
        }
      },
    });

    // Send the request with the correlationId header
    await this.producer.send({
      topic: this.requestTopic,
      messages: [
        {
          value: JSON.stringify(email),
          headers: { correlationId },
        },
      ],
    });

    // Wait for the response promise to resolve
    const response: any = await responsePromise;
    await this.producer.disconnect();
    await this.consumer.disconnect();
    return JSON.parse(response);
  }
}

export default AuthService;
