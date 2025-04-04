import { NextFunction, Request, Response } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

const mildlewares = { auth };

export default mildlewares;
