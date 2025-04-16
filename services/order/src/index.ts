import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import checkOut from "./controllers/checkOut";
import { getOrderById, getOrders } from "./controllers";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).send("UP");
});

//routes
app.post("/orders/checkout", checkOut);
app.get("/orders", getOrders);
app.get("/orders/:id", getOrderById);

//404
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

//error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 4007;
const SERVICE_NAME = process.env.SERVICE_NAME || "ORDER SERVICE";

app.listen(port, () => {
  console.log(`${SERVICE_NAME} listening on port ${port}`);
});
