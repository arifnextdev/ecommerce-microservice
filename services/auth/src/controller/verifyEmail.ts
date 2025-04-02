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
        email: parseBody.data.email,
      },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid Creadentials" });
      return;
    }

    const verificationCode = await prisma.veryficationCode.findFirst({
      where: {
        userId: user.id,
        code: parseBody.data.code,
      },
    });

    if (!verificationCode) {
      res.status(400).json({ message: "Invalid Verification Code" });
      return;
    }

    if (verificationCode.expiredAt < new Date()) {
      res.status(400).json({ message: " Verification Code Expired" });
      return;
    }

    if (verificationCode.status === "USED") {
      res.status(400).json({ message: "Verification Code Already Used" });
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
        id: verificationCode.id,
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
      source: "VERIFY_EMAIL",
    });

    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
};

export default verifyEmail;
