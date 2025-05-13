import bcrypt from "bcrypt";
import qrcode from "qrcode";
import { authenticator } from "otplib";
import { isEmail, isStrongPassword } from "validator";

import UserService from "../../../src/services/user/UserService";
import KafkaClient from "../../../src/kafka/KafkaClient";
import {
  BadRequestError,
  GatewayTimeoutError,
  NotFoundError,
} from "../../../src/middlewares/CustomError";

jest.mock("bcrypt");
jest.mock("validator");
jest.mock("otplib");

describe("User Service - findById", () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user when id is correct", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      roles: [1, 2],
      secret: "twoFaSecret",
    };

    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockResolvedValue(mockUser);

    const user = await userService.findById(1);

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          id: 1,
        },
        error: null,
      },
      "request-user-by-id",
      "response-user-by-id",
    );
    expect(user).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      profileImage: mockUser.profileImage,
      roles: mockUser.roles,
    });
  });

  it("should throw NotFoundError when id is not correct", async () => {
    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockRejectedValue(new NotFoundError("User not found"));

    await expect(userService.findById(1)).rejects.toThrow(
      new NotFoundError("User not found"),
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          id: 1,
        },
        error: null,
      },
      "request-user-by-id",
      "response-user-by-id",
    );
  });

  it("should throw GatewayTimeoutError when there is no response", async () => {
    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockRejectedValue(
        new GatewayTimeoutError(
          "Gateway Timeout",
          "Gateway request-user-by-id failed",
        ),
      );

    await expect(userService.findById(1)).rejects.toThrow(
      new GatewayTimeoutError(
        "Gateway Timeout",
        "Gateway request-user-by-id failed",
      ),
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          id: 1,
        },
        error: null,
      },
      "request-user-by-id",
      "response-user-by-id",
    );
  });
});

describe("User Service - findByEmail", () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user when email is correct", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      roles: [1, 2],
      secret: "twoFaSecret",
    };

    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockResolvedValue(mockUser);

    const user = await userService.findByEmail("test@example.com");

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          email: "test@example.com",
        },
        error: null,
      },
      "request-user-by-email",
      "response-user-by-email",
    );
    expect(user).toMatchObject(mockUser);
  });

  it("should throw NotFoundError when email is not correct", async () => {
    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockRejectedValue(new NotFoundError("User not found"));

    await expect(userService.findByEmail("test@example.com")).rejects.toThrow(
      new NotFoundError("User not found"),
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          email: "test@example.com",
        },
        error: null,
      },
      "request-user-by-email",
      "response-user-by-email",
    );
  });

  it("should throw GatewayTimeoutError when there is no response", async () => {
    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockRejectedValue(
        new GatewayTimeoutError(
          "Gateway Timeout",
          "Gateway request-user-by-email failed",
        ),
      );

    await expect(userService.findByEmail("test@example.com")).rejects.toThrow(
      new GatewayTimeoutError(
        "Gateway Timeout",
        "Gateway request-user-by-email failed",
      ),
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          email: "test@example.com",
        },
        error: null,
      },
      "request-user-by-email",
      "response-user-by-email",
    );
  });
});

describe("User Service - findAll", () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return userList when everything is ok", async () => {
    const mockUserList = [
      {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
        secret: "twoFaSecret",
      },
      {
        id: 2,
        email: "test1@example.com",
        password: "hashedPassword1",
        firstName: "firstName1",
        lastName: "lastName1",
        profileImage: "imagePath1",
        roles: [3, 4],
        secret: "twoFaSecret1",
      },
    ];

    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockResolvedValue(mockUserList);

    const userList = await userService.findAll();

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: null,
        error: null,
      },
      "request-users",
      "response-users",
    );
    expect(userList).toMatchObject([
      {
        id: mockUserList[0].id,
        email: mockUserList[0].email,
        firstName: mockUserList[0].firstName,
        lastName: mockUserList[0].lastName,
        profileImage: mockUserList[0].profileImage,
        roles: mockUserList[0].roles,
      },
      {
        id: mockUserList[1].id,
        email: mockUserList[1].email,
        firstName: mockUserList[1].firstName,
        lastName: mockUserList[1].lastName,
        profileImage: mockUserList[1].profileImage,
        roles: mockUserList[1].roles,
      },
    ]);
  });

  it("should throw GatewayTimeoutError when there is no response", async () => {
    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockRejectedValue(
        new GatewayTimeoutError(
          "Gateway Timeout",
          "Gateway request-users failed",
        ),
      );

    await expect(userService.findAll()).rejects.toThrow(
      new GatewayTimeoutError(
        "Gateway Timeout",
        "Gateway request-users failed",
      ),
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: null,
        error: null,
      },
      "request-users",
      "response-users",
    );
  });
});

describe("User Service - create", () => {
  let userService: UserService;

  beforeAll(() => {
    userService = new UserService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return imageQr when user created correctly", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      roles: [1, 2],
      secret: "twoFaSecret",
    };

    const emitEventSpy = jest
      .spyOn(KafkaClient.prototype, "emitEvent")
      .mockResolvedValue(mockUser);
    (isEmail as jest.Mock).mockReturnValue(true);
    (isStrongPassword as jest.Mock).mockReturnValue(true);
    (bcrypt.genSalt as jest.Mock).mockResolvedValue("saltExample");
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockUser.password);
    (authenticator.generateSecret as jest.Mock).mockReturnValue(
      mockUser.secret,
    );

    const imageQr = await userService.create({
      email: mockUser.email,
      password: mockUser.password,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      roles: mockUser.roles,
    });

    const otpauth = authenticator.keyuri(
      mockUser.email,
      "Imaginary CRM",
      mockUser.secret,
    );
    let imageQrMock = "";
    qrcode.toDataURL(
      otpauth,
      (error: Error | null | undefined, imageUrl: string) => {
        if (error) {
          console.log(error);
          return;
        }
        imageQrMock = imageUrl;
      },
    );

    expect(emitEventSpy).toHaveBeenCalledWith(
      {
        data: {
          email: mockUser.email,
          password: mockUser.password,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: mockUser.roles,
          profileImage: mockUser.profileImage,
          secret: mockUser.secret,
        },
        error: null,
      },
      "request-create-user",
      "response-create-user",
    );
    expect(bcrypt.genSalt).toHaveBeenCalled;
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, "saltExample");
    expect(authenticator.generateSecret).toHaveBeenCalled;
    expect(authenticator.keyuri).toHaveBeenCalledWith(
      mockUser.email,
      "Imaginary CRM",
      mockUser.secret,
    );
    expect(imageQrMock).toMatch(imageQr);
  });

  it("should throw BadRequestError when email is missing", async () => {
    await expect(
      userService.create({
        password: "hashedPassword",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("All fields must be filled"));
  });

  it("should throw BadRequestError when password is missing", async () => {
    await expect(
      userService.create({
        email: "test@example.com",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("All fields must be filled"));
  });

  it("should throw BadRequestError when first name is missing", async () => {
    await expect(
      userService.create({
        email: "test@example.com",
        password: "hashedPassword",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("All fields must be filled"));
  });

  it("should throw BadRequestError when last name is missing", async () => {
    await expect(
      userService.create({
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "firstName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("All fields must be filled"));
  });

  it("should throw BadRequestError when roles are missing", async () => {
    await expect(
      userService.create({
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
      }),
    ).rejects.toThrow(new BadRequestError("All fields must be filled"));
  });

  it("should throw BadRequestError when email is not in valid format", async () => {
    await expect(
      userService.create({
        email: "testexamplecom",
        password: "hashedPassword",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("Not a valid email!"));
  });

  it("should throw BadRequestError when password is not strong enough", async () => {
    await expect(
      userService.create({
        email: "test@example.com",
        password: "pass",
        firstName: "firstName",
        lastName: "lastName",
        profileImage: "imagePath",
        roles: [1, 2],
      }),
    ).rejects.toThrow(new BadRequestError("Password not strong enough!"));
  });
});
//TODO: implement tests for other methods
