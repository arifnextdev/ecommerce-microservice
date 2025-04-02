import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { AccessTokenSchema } from "@/schemas";
import jwt from "jsonwebtoken";

const userVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //validate the request body
    const parseBody = AccessTokenSchema.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.errors });
      return;
    }

    //Decode token
    const decodedToken = jwt.verify(
      parseBody.data.token,
      process.env.JWT_SCRECT_KEY
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export default userVerify;
