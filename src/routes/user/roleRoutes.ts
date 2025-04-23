import { Router } from "express";

import {
  getRoleById,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../controllers/user/roleController";
import { isAdmin, verifyToken } from "../../middlewares/auth";

const router = Router();

router.use(verifyToken);
router.use(isAdmin);

router.get("/:id", getRoleById);
router.get("/", getRoles);
router.post("/", createRole);
router.patch("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
