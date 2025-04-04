import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 4006;
export const SERVICE_NAME = process.env.SERVICE_NAME || "CART SERVICE";
export const REDIS_HOST = process.env.REDIS_HOST || "localhost";

export const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT)
  : 6379;

export const CART_TTL = process.env.CART_TTL
  ? parseInt(process.env.CART_TTL)
  : 60; // 1 day

export const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || "http://localhost:4002";
