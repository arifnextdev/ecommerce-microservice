import { CART_TTL, INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = CartItemSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ errors: parseBody.error.errors });
      return;
    }

    let cartSesstionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSesstionId) {
      cartSesstionId = req.cookies["x-cart-session-id"] || null;
    }

    if (cartSesstionId) {
      const exist = await redis.exists(`sessions:${cartSesstionId}`);
      console.log("session exist", exist);
      if (!exist) {
        cartSesstionId = null;
      }
    }

    if (!cartSesstionId) {
      cartSesstionId = uuid();

      console.log("Creating new cart session id", cartSesstionId);

      await redis.setex(`sessions:${cartSesstionId}`, CART_TTL, cartSesstionId);
      res.setHeader("x-cart-session-id", cartSesstionId);

      console.log("Setting cart session id in cookie", cartSesstionId);
    }

    //Check the Inventory is available

    const { data } = await axios.get(
      `${INVENTORY_SERVICE_URL}/inventorys/${parseBody.data?.inventoryId}`
    );

    if (Number(data.quantity) < parseBody.data?.quantity) {
      res.status(400).json({
        message: "Inventory is not available",
      });
      return;
    }

    await redis.hset(
      `carts:${cartSesstionId}`,
      parseBody.data?.productId,
      JSON.stringify({
        quantity: parseBody.data?.quantity,
        inventoryId: parseBody.data?.inventoryId,
      })
    );

    await axios.put(
      `${INVENTORY_SERVICE_URL}/inventorys/${parseBody.data?.inventoryId}`,
      {
        quantity: parseBody.data?.quantity,
        actionType: "OUT",
      }
    );

    res.status(200).json({
      message: "Item added to cart",
      cartSesstionId,
    });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
