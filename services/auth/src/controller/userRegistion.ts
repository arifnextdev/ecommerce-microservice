import { USER_SERVICE_URL } from "./../config";
import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { userCreateSchema } from "../schemas";
import becrypt from "bcryptjs";
import axios from "axios";
const userRegistion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //validate the request body
    const parseBody = userCreateSchema.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.errors });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    //hash password
    const hashPassword = await becrypt.hash(parseBody.data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parseBody.data.name,
        email: parseBody.data.email,
        password: hashPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        veryfied: true,
        status: true,
        createdAt: true,
      },
    });

    console.log("User created successfully", user);

    await axios.post(`${process.env.USER_SERVICE_URL}/users`, {
      authUserId: user.id,
      name: user.name,
      email: user.email,
    });

    //Generate Verification code

    //Code send to user by email

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    next(error);
  }
};

export default userRegistion;
