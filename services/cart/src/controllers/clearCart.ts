import { Request, Response, NextFunction } from "express";
import redis from "@/redis";
import axios from "axios";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
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
      delete req.headers["x-cart-session-id"];
      await redis.del(`sessions:${cartSessionId}`);
      res.status(400).json({ data: [] });
      return;
    }

    await redis.del(`carts:${cartSessionId}`);

    await redis.del(`sessions:${cartSessionId}`);
    console.log("Cart cleared successfully");
    res.status(200).json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default clearCart;
