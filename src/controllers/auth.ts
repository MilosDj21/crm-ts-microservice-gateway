import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../middlewares/CustomError";
import AuthService from "../services/auth";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, twoFaToken } = req.body;
  try {
    if (!email || !password || !twoFaToken)
      throw new BadRequestError("All fields must be filled");

    const authService = new AuthService();
    const user = await authService.login(email, password, twoFaToken);

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export { login };
