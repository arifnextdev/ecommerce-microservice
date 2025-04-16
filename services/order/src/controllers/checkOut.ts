import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import axios from "axios";
import { CartItemSchema, orderSchema } from "@/schemas";
import {
  CART_SERVICE_URL,
  EMAIL_SERVICE_URL,
  PRODUCT_SERVICE_URL,
} from "@/config";
import { z } from "zod";

const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = orderSchema.safeParse(req.body);

    if (!parseBody.success) {
      res.status(400).json({ error: parseBody.error.errors });
      return;
    }

    //get Cart items
    const { data: cartData } = await axios.get(`${CART_SERVICE_URL}/cart/me`, {
      headers: {
        "x-cart-session-id": parseBody.data.cartSessionId,
      },
    });

    const cartItems = z.array(CartItemSchema).safeParse(cartData.data);
    if (!cartItems.success) {
      res.status(400).json({ error: cartItems.error.errors });
      return;
    }

    if (cartItems.data.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    //get Product Details from cart items
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        console.log("Item", item);
        const { data: product } = await axios.get(
          `${PRODUCT_SERVICE_URL}/products/${item.productId}`
        );

        return {
          productId: product.id as string,
          productName: product.name as string,
          sku: product.sku as string,
          price: product.price as number,
          quantity: item.quantity as number,
          total: product.price * item.quantity,
        };
      })
    );

    const subTotal = productDetails.reduce((acc, item) => acc + item.total, 0);

    const tax = 0;
    const grandTotal = subTotal + tax;

    //create Order
    const order = await prisma.order.create({
      data: {
        userId: parseBody.data.userId,
        userName: parseBody.data.userName,
        userEmail: parseBody.data.userEmail,
        userPhone: parseBody.data.userPhone,
        userAddress: parseBody.data.userAddress,
        subtotal: subTotal,
        tax,
        grandTotal,
        orderItems: {
          create: productDetails.map((item) => ({ ...item })),
        },
      },
    });
    console.log("Order Created");

    //clear cart
    await axios.get(`${CART_SERVICE_URL}/cart/clear`, {
      headers: {
        "x-cart-session-id": parseBody.data.cartSessionId,
      },
    });
    console.log("Cart cleared successfully");

    //Send Email
    await axios.post(`${EMAIL_SERVICE_URL}/email/send`, {
      recipient: parseBody.data.userEmail,
      subject: "Order Confirmation",
      body: `Your order has been placed successfully. Order ID: ${order.id}, Your Order Total: ${grandTotal}`,
      source: "checkout",
    });
    console.log("Email sent successfully");
    res.status(201).json("Order placed successfully");
  } catch (error) {
    next(error);
  }
};

export default checkOut;
