import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import jwt from "jsonwebtoken";

import AuthService from "../../../src/services/user/AuthService";
import UserService from "../../../src/services/user/UserService";
import { UnauthorizedError } from "../../../src/middlewares/CustomError";
import { mock } from "node:test";

jest.mock("bcrypt");
jest.mock("otplib");
jest.mock("jsonwebtoken");

describe("Auth Service - login", () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
    process.env.JWT_SECRET = "jwtSecret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user object when login is successful", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      secret: "twoFaSecret",
    };

    const findByEmailSpy = jest
      .spyOn(UserService.prototype, "findByEmail")
      .mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fakeJwtToken");

    const user = await authService.login(
      "test@example.com",
      "password123",
      "twoFaToken",
    );

    expect(findByEmailSpy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
    expect(authenticator.verify).toHaveBeenCalledWith({
      token: "twoFaToken",
      secret: "twoFaSecret",
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "jwtSecret", {
      expiresIn: 3 * 24 * 60 * 60,
    });
    expect(user).toMatchObject({
      id: 1,
      email: "test@example.com",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      jwtToken: "fakeJwtToken",
    });
  });

  it("should throw UnauthorizedError when email is not correct", async () => {
    const findByEmailSpy = jest
      .spyOn(UserService.prototype, "findByEmail")
      .mockRejectedValue(new UnauthorizedError("Credentials not correct"));

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(new UnauthorizedError("Credentials not correct"));

    expect(findByEmailSpy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("should throw UnauthorizedError when password is not correct", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      secret: "twoFaSecret",
    };

    const findByEmailSpy = jest
      .spyOn(UserService.prototype, "findByEmail")
      .mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(new UnauthorizedError("Credentials not correct"));

    expect(findByEmailSpy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
  });

  it("should throw UnauthorizedError when two fa token is not correct", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      secret: "twoFaSecret",
    };

    const findByEmailSpy = jest
      .spyOn(UserService.prototype, "findByEmail")
      .mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authenticator.verify as jest.Mock).mockReturnValue(false);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(
      new UnauthorizedError("Credentials not correct", "Two FA not valid"),
    );

    expect(findByEmailSpy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
    expect(authenticator.verify).toHaveBeenCalledWith({
      token: "twoFaToken",
      secret: "twoFaSecret",
    });
  });

  it("should throw Error when creating JWT fails", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      secret: "twoFaSecret",
    };

    const findByEmailSpy = jest
      .spyOn(UserService.prototype, "findByEmail")
      .mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(null);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(Error("Creating jwt failed"));

    expect(findByEmailSpy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
    expect(authenticator.verify).toHaveBeenCalledWith({
      token: "twoFaToken",
      secret: "twoFaSecret",
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "jwtSecret", {
      expiresIn: 3 * 24 * 60 * 60,
    });
  });
});
