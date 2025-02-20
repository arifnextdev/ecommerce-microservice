import { z } from "zod";
import { STATUS } from "@prisma/client";

export const productCreateSchema = z.object({
  sku: z.string().min(3).max(10),
  name: z.string().min(3).max(255),
  description: z.string().max(100).optional(),
  price: z.number().optional().default(0),
  status: z.nativeEnum(STATUS).optional().default(STATUS.DRAFT),
});
