import { Router } from "express";

import {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  getUserTickets,
} from "../../controllers/user/userController";
import {
  isAdmin,
  isCurrentUserOrAdmin,
  verifyToken,
} from "../../middlewares/auth";
import multerConf from "../../middlewares/multerConf";

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

//ticket route
router.get("/:id/tickets", [isCurrentUserOrAdmin], getUserTickets);

export default router;
