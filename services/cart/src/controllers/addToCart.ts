import { CART_TTL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schemas";
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

    if (cartSesstionId) {
      const exist = await redis.exists(`sessions:${cartSesstionId}`);
      if (!exist) {
        cartSesstionId = null;
      }
    }

    if (!cartSesstionId) {
      cartSesstionId = uuid();

      console.log("Creating new cart session id", cartSesstionId);

      await redis.setex(
        `sessions:${cartSesstionId}`,
        CART_TTL,
        JSON.stringify([])
      );
      res.setHeader("x-cart-session-id", cartSesstionId);

      console.log("Setting cart session id in cookie", cartSesstionId);
    }

    await redis.hset(
      `carts:${cartSesstionId}`,
      parseBody.data?.inventoryId,
      JSON.stringify({
        quantity: parseBody.data?.quantity,
        inventoryId: parseBody.data?.inventoryId,
      })
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
