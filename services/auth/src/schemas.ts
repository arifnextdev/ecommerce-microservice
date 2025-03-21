import e from "express";
import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});
