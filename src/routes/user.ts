import { Router } from "express";

import {
  deleteOne,
  getAll,
  getOne,
  saveOne,
  updateOne,
} from "../controllers/user";
import {
  isAdmin,
  isCurrentUserOrAdmin,
  verifyToken,
} from "../middlewares/auth";
import multerConf from "../middlewares/multerConf";

const router = Router();

router.use(verifyToken);

router.get("/:id", [isCurrentUserOrAdmin], getOne);
router.get("/", [isAdmin], getAll);
router.post("/", [isAdmin, multerConf], saveOne);
router.patch("/:id", [isCurrentUserOrAdmin, multerConf], updateOne);
router.delete("/:id", [isAdmin], deleteOne);
//role route
router.get("/:id/roles", [isCurrentUserOrAdmin], getUserRoles);

export default router;
