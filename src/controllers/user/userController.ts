import { NextFunction, Request, Response } from "express";

import { BadRequestError, NotFoundError } from "../../middlewares/CustomError";
import UserService from "../../services/user/UserService";
import { User } from "../../interfaces";
import RoleService from "../../services/user/RoleService";

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

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = new UserService();
    const userList = userService.findAll();
    res.status(200).json({ data: userList });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, roleIds } = req.body;
  const profileImage = req.file;
  try {
    const userObject: User = {
      email,
      password,
      firstName,
      lastName,
      profileImage: profileImage ? profileImage.path : "",
      roles: roleIds,
    };
    const userService = new UserService();
    const imageQr = await userService.create(userObject);

    res.status(200).json({
      data: imageQr,
      message: "Added Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const { email, firstName, lastName, password, roles } = req.body;
  const profileImage = req.file;
  try {
    if (!userId || isNaN(parseInt(userId)))
      throw new BadRequestError("Invalid id");

    const user: User = {
      id: parseInt(userId),
      email,
      firstName,
      lastName,
      password,
      roles,
      profileImage: profileImage ? profileImage.path : "",
    };

    const userService = new UserService();
    const updatedUser = await userService.update(user);
    res.status(200).json({
      data: updatedUser,
      message: "Updated Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  try {
    if (!userId || isNaN(parseInt(userId)))
      throw new BadRequestError("Invalid id");

    const userService = new UserService();
    const user = await userService.removeById(parseInt(userId));
    if (!user) throw new NotFoundError("User not found");

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};

const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.id;
  try {
    if (!userId || isNaN(parseInt(userId)))
      throw new BadRequestError("Invalid id");

    const roleService = new RoleService();
    const roles = await roleService.findByUserId(parseInt(userId));
    if (!roles || roles.length == 0) throw new NotFoundError("Roles not found");

    res.status(200).json({ data: roles });
  } catch (err) {
    next(err);
  }
};

export {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
};
