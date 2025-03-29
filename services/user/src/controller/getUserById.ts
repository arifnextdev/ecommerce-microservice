import prisma from "@/prisma";
import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;

    let user: User | null;

    if (field === "authUserId") {
      user = await prisma.user.findUnique({
        where: {
          authUserId: id,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
    }

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export default getUserById;
