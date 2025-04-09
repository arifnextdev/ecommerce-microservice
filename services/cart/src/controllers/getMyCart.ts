import { Request, Response, NextFunction } from "express";
import redis from "@/redis";
import { CART_TTL } from "@/config";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;
    if (!cartSessionId) {
      console.log("No cart session id found");
      res.status(400).json({ data: [] });
      return;
    }

    const session = await redis.exists(`sessions:${cartSessionId}`);
    if (!session) {
      console.log("Cart session id not found");
      await redis.del(`sessions:${cartSessionId}`);
      res.status(400).json({ data: [] });
      return;
    }

    const items = await redis.hgetall(`carts:${cartSessionId}`);

    if (Object.keys(items).length === 0) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const carts = Object.keys(items).map((key) => {
      const { inventoryId, quantity } = JSON.parse(items[key]) as {
        inventoryId: string;
        quantity: number;
      };
      return {
        inventoryId,
        quantity,
        productId: key,
      };
    });

    res.status(200).json({
      data: carts,
    });
  } catch (error) {
    next(error);
  }
};
export default getMyCart;
