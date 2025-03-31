import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import KafkaClient from "../kafka/KafkaClient";

import { UnauthorizedError } from "../middlewares/CustomError";

class AuthService {
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
    const kafkaClient = KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      { email },
      "request-user-by-email",
      "response-user-by-email",
    );
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
}

export default AuthService;
