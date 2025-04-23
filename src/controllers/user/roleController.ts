import { NextFunction, Request, Response } from "express";

import { BadRequestError, NotFoundError } from "../../middlewares/CustomError";
import RoleService from "../../services/user/RoleService";

const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  const roleId = req.params.id;
  try {
    if (!roleId || isNaN(parseInt(roleId)))
      throw new BadRequestError("Invalid id");

    const roleService = new RoleService();
    const role = await roleService.findById(parseInt(roleId));
    if (!role) throw new NotFoundError("Role not found");

    res.status(200).json({ data: role });
  } catch (err) {
    next(err);
  }
};

const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleService = new RoleService();
    const roleList = roleService.findAll();
    res.status(200).json({ data: roleList });
  } catch (err) {
    next(err);
  }
};

const createRole = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  try {
    if (!name) throw new BadRequestError("All fields must be filled");

    const roleService = new RoleService();
    const role = await roleService.create(name);

    res.status(200).json({
      data: role,
      message: "Added Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  const roleId = req.params.id;
  const { name } = req.body;
  try {
    if (!roleId || isNaN(parseInt(roleId)))
      throw new BadRequestError("Invalid id");
    if (!name) throw new BadRequestError("Nothing to update");

    const roleService = new RoleService();
    const updatedRole = await roleService.update(parseInt(roleId), name);
    res.status(200).json({
      data: updatedRole,
      message: "Updated Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  const roleId = req.params.id;
  try {
    if (!roleId || isNaN(parseInt(roleId)))
      throw new BadRequestError("Invalid id");

    const roleService = new RoleService();
    const role = await roleService.removeById(parseInt(roleId));
    if (!role) throw new NotFoundError("Role not found");

    res.status(200).json({ data: role });
  } catch (err) {
    next(err);
  }
};

export { getRoleById, getRoles, createRole, updateRole, deleteRole };
