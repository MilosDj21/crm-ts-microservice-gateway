import { Application } from "express";
import request from "supertest";
import AuthService from "../../../src/services/user/AuthService";
import { UnauthorizedError } from "../../../src/middlewares/CustomError";
import { createApp } from "../../../src/createApp";

describe("User Authentication", () => {
  describe("POST /login", () => {
    let app: Application;

    beforeAll(() => {
      app = createApp();
    });

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
    });

    it("should return 200 and a token for valid credentials", async () => {
      const loginSpy = jest
        .spyOn(AuthService.prototype, "login")
        .mockResolvedValue({
          id: 1,
          email: "test@example.com",
          firstName: "testName",
          lastName: "testLastName",
          profileImage: "testImagePath",
          jwtToken: "fakeToken",
        });

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
        twoFaToken: "testTwoFaToken",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data", {
        id: 1,
        email: "test@example.com",
        firstName: "testName",
        lastName: "testLastName",
        profileImage: "testImagePath",
        jwtToken: "fakeToken",
      });
      expect(loginSpy).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "testTwoFaToken",
      );
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "",
        password: "password123",
        twoFaToken: "testTwoFaToken",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "All fields must be filled",
      );
    });

    it("should return 400 when password is missing", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "",
        twoFaToken: "testTwoFaToken",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "All fields must be filled",
      );
    });

    it("should return 400 when twoFaToken is missing", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
        twoFaToken: "",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "All fields must be filled",
      );
    });

    it("should return 401 for invalid credentials", async () => {
      const loginSpy = jest
        .spyOn(AuthService.prototype, "login")
        .mockRejectedValue(new UnauthorizedError("Credentials not correct"));

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
        twoFaToken: "testTwoFaToken",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Credentials not correct");
      expect(loginSpy).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword",
        "testTwoFaToken",
      );
    });
  });
});
