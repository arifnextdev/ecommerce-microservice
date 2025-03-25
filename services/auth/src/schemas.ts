import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AccessTokenSchema = z.object({
  token: z.string(),
});
