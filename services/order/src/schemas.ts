import { z } from "zod";

// Order schema
export const orderSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  userPhone: z.string(),
  userAddress: z.string(),
  cartSessionId: z.string(),
});

export const CartItemSchema = z.object({
  productId: z.string(),
  inventoryId: z.string(),
  quantity: z.number(),
});
