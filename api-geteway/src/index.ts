import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests" });
  },
});

app.use("/api", rateLimiter);

// Requiest logger
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//Health
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Api Geteway is Running" });
});

//Routes
configureRoutes(app);

//404
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

//error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
