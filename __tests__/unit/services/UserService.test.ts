import UserService from "../../../src/services/user/UserService";
import KafkaClient from "../../../src/kafka/KafkaClient";
import {
  GatewayTimeoutError,
  NotFoundError,
} from "../../../src/middlewares/CustomError";

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
//TODO: implement tests for other methods
