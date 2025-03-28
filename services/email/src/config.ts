import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "2525"),
});

export const default_sender = process.env.DEFAULT_EMAIL || "admin@gmail.com";
