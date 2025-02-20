import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { productCreateSchema } from "@/schemas";
import { INVENTORY_SERVICE_URL } from "@/config";
import axios from "axios";
import { error } from "console";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = productCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: parseBody.error.errors,
      });
      return;
    }

    const productAlreadyExists = await prisma.product.findFirst({
      where: {
        sku: parseBody.data.sku,
      },
      select: {
        id: true,
      },
    });

    if (productAlreadyExists) {
      res.status(400).json({ message: "Product already exists" });
      return;
    }

    const product = await prisma.product.create({
      data: parseBody.data,
    });
    console.log("Product Created Successfully", product.id);

    //Create Inventory

    const { data: inventory } = await axios.post(
      `${INVENTORY_SERVICE_URL}/inventorys`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    console.log("Inventory Created Successfully", inventory.id);

    //Update product
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });

    console.log("product Successfully Updated with inventoryId", inventory.id);

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (error) {
    next(error);
  }
};

export default createProduct;
