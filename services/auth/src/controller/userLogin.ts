import becrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "@/prisma";

import { userLoginSchema } from "../schemas";
import { LoginAttemt } from "@prisma/client";

type LoginHistory = {
  ipAddress: string | undefined;
  userAgent: string | undefined;
  userId: string;
  attempt: LoginAttemt;
};

const createLoginHistorey = async (info: LoginHistory) => {
  await prisma.history.create({
    data: {
      ipAddress: info.ipAddress,
      userAgent: info.userAgent,
      userId: info.userId,
      attempt: info.attempt,
    },
  });
};

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";

    const userAgent = req.headers["user-agent"] || "";

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
      await createLoginHistorey({
        ipAddress,
        userAgent,
        userId: "GUEST",
        attempt: "FAILD",
      });
      return;
    }

    const isPasswordValid = await becrypt.compare(
      parseBody.data.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid Creadentials" });
      await createLoginHistorey({
        ipAddress,
        userAgent,
        userId: user.id,
        attempt: "FAILD",
      });
      return;
    }

    if (!user.veryfied) {
      res.status(400).json({ error: "User not verified" });

      await createLoginHistorey({
        ipAddress,
        userAgent,
        userId: user.id,
        attempt: "FAILD",
      });
    }

    //check user is active
    if (user.status !== "ACTIVE") {
      res.status(400).json({ message: `Your account is ${user.status}` });
      await createLoginHistorey({
        ipAddress,
        userAgent,
        userId: user.id,
        attempt: "FAILD",
      });
    }

    //Generate JWT token

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },

      (process.env.JWT_SCRECT_KEY as string) || "my-screct-key",
      {
        expiresIn: "24h",
      }
    );

    await createLoginHistorey({
      ipAddress,
      userAgent,
      userId: user.id,
      attempt: "SUCCESS",
    });

    res.status(200).json({ message: "Login successful", token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default userLogin;
