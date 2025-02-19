import { ActionType } from "@prisma/client";
import { z } from "zod";

export const inventorySchema = z.object({
  sku: z.string(),
  productId: z.string(),
  quantity: z.number().int().optional().default(0),
});

// export type Inventory = z.infer<typeof inventorySchema>;

export const inventorySchemaUpdate = z.object({
  quantity: z.number().int(),
  actionType: z.nativeEnum(ActionType),
});
