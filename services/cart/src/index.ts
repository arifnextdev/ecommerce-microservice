import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { addToCart, clearCart, getMyCart } from "./controllers";
import "@/events/onKeyExpier";

dotenv.config();

const app = express();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests" });
  },
});

// Requiest logger
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//Health
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Cart Service is Running" });
});

//Routes

app.post("/cart", addToCart);
app.get("/cart/me", getMyCart);
app.get("/cart/clear", clearCart);

//404
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

//error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 4001;
const SERVICE_NAME = process.env.SERVICE_NAME || "CART SERVICE";

app.listen(port, () => {
  console.log(`${SERVICE_NAME} listening on port ${port}`);
});
