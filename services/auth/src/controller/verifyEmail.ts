import { Request, Response, NextFunction } from "express";

import prisma from "@/prisma";
import { userVerifySchema } from "@/schemas";
import axios from "axios";
import { EMAIL_SERVICE_URL } from "@/config";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const parseBody = userVerifySchema.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.errors });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseBody.data.email,
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid Creadentials" });
      return;
    }

    const verifyCode = await prisma.veryficationCode.findFirst({
      where: {
        userId: user.id,
        code: parseBody.data.code,
      },
    });

    if (!verifyCode) {
      res.status(400).json({ error: "Invalid Creadentials" });
      return;
    }

    if (verifyCode.code !== parseBody.data.code) {
      res.status(400).json({ error: "Invalid Code" });
      return;
    }

    if (verifyCode.expiredAt < new Date()) {
      res.status(400).json({ error: "Code Expired" });
      return;
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        veryfied: true,
        status: "ACTIVE",
      },
    });

    ///Update verification code
    await prisma.veryficationCode.update({
      where: {
        id: verifyCode.id,
      },
      data: {
        status: "USED",
        veryfiedAt: new Date(),
      },
    });

    await axios.post(`${EMAIL_SERVICE_URL}/email/send`, {
      recipient: user.email,
      subject: "Account Verification",
      body: `Hello ${user.name} your account has been verified successfully`,
      srouce: "VERIFY_EMAIL",
    });

    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
};

export default verifyEmail;
