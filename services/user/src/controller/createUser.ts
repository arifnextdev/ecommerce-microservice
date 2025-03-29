import prisma from "@/prisma";
import { userCreateSchema } from "../schemas";
import { NextFunction, Request, Response } from "express";

const createNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseBody = userCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error });
      return;
    }

    const exitUser = await prisma.user.findUnique({
      where: {
        authUserId: parseBody.data.authUserId,
      },
    });

    if (exitUser) {
      res.status(400).json({ error: "User already exist" });
      return;
    }

    const user = await prisma.user.create({
      data: parseBody.data,
    });

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default createNewUser;
