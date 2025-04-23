import { NextFunction, Request, Response } from "express";

import { BadRequestError, NotFoundError } from "../../middlewares/CustomError";
import TicketService from "../../services/ticket/TicketService";
import { Ticket } from "../../interfaces";

const getTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ticketId = req.params.id;
  try {
    if (!ticketId || isNaN(parseInt(ticketId)))
      throw new BadRequestError("Invalid id");

    const ticketService = new TicketService();
    const ticket = await ticketService.findById(parseInt(ticketId));
    if (!ticket) throw new NotFoundError("Ticket not found");

    res.status(200).json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketService = new TicketService();
    const ticketList = ticketService.findAll();
    res.status(200).json({ data: ticketList });
  } catch (err) {
    next(err);
  }
};

const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const { title, category } = req.body;
  try {
    if (!title || !category)
      throw new BadRequestError("All fields must be filled");

    const ticketObject: Ticket = {
      title,
      status: "New",
      category,
      user: userId,
      seenByAdmin: false,
    };

    const ticketService = new TicketService();
    const ticket = await ticketService.create(ticketObject);

    res.status(200).json({
      data: ticket,
      message: "Added Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ticketId = req.params.id;
  const { title, status, category, seenByAdmin } = req.body;
  try {
    if (!ticketId || isNaN(parseInt(ticketId)))
      throw new BadRequestError("Invalid id");

    const ticketObject: Ticket = {
      id: parseInt(ticketId),
      title,
      status,
      category,
      seenByAdmin,
    };

    const ticketService = new TicketService();
    const updatedTicket = await ticketService.update(ticketObject);
    res.status(200).json({
      data: updatedTicket,
      message: "Updated Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ticketId = req.params.id;
  try {
    if (!ticketId || isNaN(parseInt(ticketId)))
      throw new BadRequestError("Invalid id");

    const ticketService = new TicketService();
    const ticket = await ticketService.removeById(parseInt(ticketId));
    if (!ticket) throw new NotFoundError("Ticket not found");

    res.status(200).json({ data: ticket });
  } catch (err) {
    next(err);
  }
};

export { getTicketById, getTickets, createTicket, updateTicket, deleteTicket };
