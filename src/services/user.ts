import qrcode from "qrcode";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import { isEmail, isStrongPassword } from "validator";

import { BadRequestError } from "../middlewares/CustomError";
import KafkaClient from "../kafka/KafkaClient";
import { User } from "../interfaces";

class UserService {
  public findById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-user-by-id",
      "response-user-by-id",
    );
    return user;
  };

  public findByEmail = async (email: string) => {
    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: {
          email,
        },
        error: null,
      },
      "request-user-by-email",
      "response-user-by-email",
    );
    return user;
  };

  public findAll = async () => {
    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: null,
        error: null,
      },
      "request-users",
      "response-users",
    );
    return user;
  };

  public create = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profileImage: string,
    roleIds: Array<number>,
  ) => {
    if (!isEmail(email)) throw new BadRequestError("Not a valid email!");
    if (!isStrongPassword(password))
      throw new BadRequestError("Password not strong enough!");

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, "Imaginary CRM", secret);
    let imageQr = "";
    qrcode.toDataURL(
      otpauth,
      (error: Error | null | undefined, imageUrl: string) => {
        if (error) {
          console.log(error);
          return;
        }
        imageQr = imageUrl;
      },
    );

    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: {
          email,
          password: hashPassword,
          firstName,
          lastName,
          profileImage,
          secret,
          roleIds,
        },
        error: null,
      },
      "request-create-user",
      "response-create-user",
    );
    if (!user) throw new Error("Failed to save user to the db");

    return imageQr;
  };

  public update = async (userObject: User) => {
    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: {
          userObject,
        },
        error: null,
      },
      "request-update-user",
      "response-update-user",
    );
    return user;
  };

  public findRolesByUserId = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const userRoles = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-user-roles-by-user-id",
      "response-user-roles-by-user-id",
    );
    return userRoles;
  };
}

export default UserService;
