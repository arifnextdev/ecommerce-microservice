import { Request, Response, NextFunction } from "express";
import redis from "@/redis";
import { CART_TTL } from "@/config";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;
    if (!cartSessionId) {
      res.status(400).json({ data: [] });
      return;
    }

    const session = await redis.exists(`sessions:${cartSessionId}`);
    if (!session) {
      await redis.del(`sessions:${cartSessionId}`);
      res.status(400).json({ data: [] });
      return;
    }

    const cart = await redis.hgetall(`carts:${cartSessionId}`);

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    res.status(200).json({
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
export default getMyCart;
