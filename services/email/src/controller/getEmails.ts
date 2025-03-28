import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getEmails = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const emails = await prisma.email.findMany();
    res.status(200).json(emails);
  } catch (error) {
    next(error);
  }
};

export default getEmails;
