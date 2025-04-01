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

const router = Router();

router.use(verifyToken);

router.get("/:id", [isCurrentUserOrAdmin], getOne);
router.get("/", [isAdmin], getAll);
router.post("/", [isAdmin], saveOne);
router.patch("/:id", [isCurrentUserOrAdmin], updateOne);
router.delete("/:id", [isAdmin], deleteOne);

export default router;
