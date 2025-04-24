import { Router } from "express";

import {
  getTicketById,
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../../controllers/ticket/ticketController";
import {
  isAdmin,
  verifyToken,
  isCurrentUserOrAdmin,
} from "../../middlewares/auth";

const router = Router();

router.use(verifyToken);

router.get("/:id", [isCurrentUserOrAdmin], getTicketById);
router.get("/", [isAdmin], getTickets);
router.post("/", createTicket);
router.patch("/:id", [isCurrentUserOrAdmin], updateTicket);
router.delete("/:id", [isCurrentUserOrAdmin], deleteTicket);

export default router;
