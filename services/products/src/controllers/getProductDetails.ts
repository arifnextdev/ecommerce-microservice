import { INVENTORY_SERVICE_URL } from "@/config";
import prisma from "@/prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.inventoryId === null) {
      const { data: inventory } = await axios.post(
        `${INVENTORY_SERVICE_URL}/inventorys`,
        {
          productId: product.id,
          sku: product.sku,
        }
      );

      // Update product
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          inventoryId: inventory.id,
        },
      });
      res.status(200).json({
        data: {
          ...product,
          inventoryId: product.inventoryId,
          sotock: inventory.quantity || 0,
          stocksStatus: inventory.quantity > 0 ? "In Stock" : "Out of Stock",
        },
      });
    }

    // Get Inventory
    const { data: inventory } = await axios.get(
      `${INVENTORY_SERVICE_URL}/inventorys/${product.inventoryId}`
    );

    res.status(200).json({
      ...product,
      inventoryId: product.inventoryId,
      stock: inventory.quantity || 0,
      stockStatus: inventory.quantity > 0 ? "In Stock" : "Out of Stock",
    });
  } catch (error) {
    next(error);
  }
};

export default getProductDetails;
