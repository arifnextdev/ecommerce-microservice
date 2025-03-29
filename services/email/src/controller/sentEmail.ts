import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { emailSchema } from "../schemas";
import { default_sender, transporter } from "@/config";
import exp from "constants";

const sentEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = emailSchema.safeParse(req.body);

    console.log("parseBody", parseBody.error?.errors);

    if (!parseBody.success) {
      res.status(400).json(parseBody.error);
      return;
    }

    const { recipient, subject, body, sender, source } = parseBody.data;

    console.log("rejected");
    const from = sender || default_sender;

    const emailOptions = {
      from,
      to: recipient,
      subject,
      text: body,
    };

    //send email

    const { rejected } = await transporter.sendMail(emailOptions);

    if (rejected.length) {
      console.log("email rejected", rejected);
      res.status(500).json({ message: "Failed to send email" });
    }

    await prisma.email.create({
      data: {
        sender: from,
        recipient,
        subject,
        body,
        source,
      },
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export default sentEmail;
