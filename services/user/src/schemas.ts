import { z } from "zod";

export const userCreateSchema = z.object({
  authUserId: z.string().nonempty(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UserUpdateSchema = userCreateSchema
  .omit({ authUserId: true })
  .partial();
