import { Request, Response, NextFunction } from "express";

import prisma from "@/prisma";

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({});
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export default getOrders;
