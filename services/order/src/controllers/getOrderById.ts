import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        orderItems: true,
      },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export default getOrderById;
