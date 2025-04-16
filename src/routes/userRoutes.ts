import { Router } from "express";

import {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
} from "../controllers/userController";
import {
  isAdmin,
  isCurrentUserOrAdmin,
  verifyToken,
} from "../middlewares/auth";
import multerConf from "../middlewares/multerConf";

const router = Router();

router.use(verifyToken);

//user routes
router.get("/:id", [isCurrentUserOrAdmin], getUserById);
router.get("/", [isAdmin], getUsers);
router.post("/", [isAdmin, multerConf], createUser);
router.patch("/:id", [isCurrentUserOrAdmin, multerConf], updateUser);
router.delete("/:id", [isAdmin], deleteUser);

//role route
router.get("/:id/roles", [isCurrentUserOrAdmin], getUserRoles);

export default router;
