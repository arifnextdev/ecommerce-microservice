import becrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "@/prisma";

import { userLoginSchema } from "../schemas";
import exp from "constants";

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //validate the request body
    const parseBody = userLoginSchema.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.errors });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid Creadentials" });
      return;
    }

    const isPasswordValid = await becrypt.compare(
      parseBody.data.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid Creadentials" });
      return;
    }

    if (!user.veryfied) {
      res.status(400).json({ error: "User not verified" });
    }

    //check user is active
    if (user.status !== "ACTIVE") {
      res.status(400).json({ message: `Your account is ${user.status}` });
    }

    //Generate JWT token

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },

      process.env.JWT_SECRET as string,
      {
        expiresIn: "30d",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1y",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
