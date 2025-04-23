import qrcode from "qrcode";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import { isEmail, isStrongPassword } from "validator";

import { BadRequestError } from "../../middlewares/CustomError";
import KafkaClient from "../../kafka/KafkaClient";
import { User } from "../../interfaces";

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

  public create = async (userObject: User) => {
    if (
      !userObject.email ||
      !userObject.password ||
      !userObject.firstName ||
      !userObject.lastName ||
      !userObject.roles
    )
      throw new BadRequestError("All fields must be filled");
    if (!isEmail(userObject.email))
      throw new BadRequestError("Not a valid email!");
    if (!isStrongPassword(userObject.password))
      throw new BadRequestError("Password not strong enough!");

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(userObject.password, salt);
    userObject.password = hashPassword;

    const secret = authenticator.generateSecret();
    userObject.secret = secret;

    const otpauth = authenticator.keyuri(
      userObject.email,
      "Imaginary CRM",
      secret,
    );
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
        data: userObject,
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

  public removeById = async (id: number) => {
    const kafkaClient = await KafkaClient.getInstance();
    const user = await kafkaClient.emitEvent(
      {
        data: {
          id,
        },
        error: null,
      },
      "request-remove-user",
      "response-remove-user",
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
