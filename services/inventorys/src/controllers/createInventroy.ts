import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

import { inventorySchema } from "@/schemas";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = inventorySchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.message });
      return;
    }

    const inventory = await prisma.inventory.create({
      data: {
        ...parseBody.data,
        histories: {
          create: {
            actionType: "IN",
            quantityChange: parseBody.data.quantity,
            lastQuantity: 0,
            newQuantity: parseBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

export default createInventory;
