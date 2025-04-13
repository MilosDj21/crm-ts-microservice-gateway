import { NextFunction, Request, Response } from "express";

import { BadRequestError, NotFoundError } from "../middlewares/CustomError";
import UserService from "../services/user";

declare module "express" {
  export interface Request {
    file?: Express.Multer.File;
  }
}

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  try {
    if (!userId || isNaN(parseInt(userId)))
      throw new BadRequestError("Invalid id");

    const userService = new UserService();
    const user = await userService.findById(parseInt(userId));
    if (!user) throw new NotFoundError("User not found");

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req: Request, res: Response, next: NextFunction) => {};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, roleIds } = req.body;
  const profileImage = req.file;
  try {
    if (!email || !password || !firstName || !lastName || !roleIds)
      throw new BadRequestError("All fields must be filled");

    const userService = new UserService();
    const imageQr = await userService.create(
      email,
      password,
      firstName,
      lastName,
      profileImage ? profileImage.path : "",
      roleIds,
    );

    res.status(200).json({
      data: imageQr,
      message: "Added Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

export {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
};
