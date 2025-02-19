import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getInventoryDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
      include: {
        histories: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!inventory) {
      res.status(404).json({ error: "Inventory not found" });
      return;
    }
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

export default getInventoryDetails;
