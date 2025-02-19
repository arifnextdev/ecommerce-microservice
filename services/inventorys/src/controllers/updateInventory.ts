import prisma from "@/prisma";
import { inventorySchemaUpdate } from "@/schemas";
import e, { NextFunction, Request, Response } from "express";

const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //check in inventory exist
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: {
        id: id,
      },
    });

    if (!inventory) {
      res.status(404).json({ error: "Inventory not found" });
      return;
    }

    const parseBody = inventorySchemaUpdate.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.message });
      return;
    }

    //Last History
    const lastHistory = await prisma.history.findFirst({
      where: {
        inventoryId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let newQuantity = inventory.quantity;

    if (parseBody.data.actionType === "IN") {
      newQuantity += parseBody.data.quantity;
    } else if (parseBody.data.actionType === "OUT") {
      newQuantity -= parseBody.data.quantity;
    } else {
      res.status(400).json({ error: "Invalid action type" });
      return;
    }

    const updatedInventory = await prisma.inventory.update({
      where: {
        id: id,
      },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: parseBody.data.actionType,
            quantityChange: parseBody.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.status(200).json(updatedInventory);
  } catch (error) {
    next(error);
  }
};

export default updateInventory;
