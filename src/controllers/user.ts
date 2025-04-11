import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../middlewares/CustomError";
import UserService from "../services/user";

declare module "express" {
  export interface Request {
    file?: Express.Multer.File;
  }
}

const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

const getUsers = async (req: Request, res: Response, next: NextFunction) => {};

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

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
