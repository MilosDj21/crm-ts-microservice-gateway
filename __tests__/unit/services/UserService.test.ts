import UserService from "../../../src/services/user/UserService";
import KafkaClient from "../../../src/kafka/KafkaClient";

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

    const user = userService.findById(1);

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

  //TODO: implement tests for other cases
});
//TODO: implement tests for other methods
