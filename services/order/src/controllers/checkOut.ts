import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import axios from "axios";
import { CartItemSchema, orderSchema } from "@/schemas";
import { CART_SERVICE_URL, EMAIL_SERVICE_URL } from "@/config";
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

    const cartItems = z.array(CartItemSchema).safeParse(cartData);
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
        const { data } = await axios.get(
          `${CART_SERVICE_URL}/products/${item.productId}`
        );
        return {
          productId: data.id as string,
          productName: data.name as string,
          sku: data.sku as string,
          price: data.price as number,
          quantity: item.quantity as number,
          total: data.price * item.quantity,
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

    //clear cart
    await axios.get(`${CART_SERVICE_URL}/cart/clear`, {
      headers: {
        "x-cart-session-id": parseBody.data.cartSessionId,
      },
    });

    //Send Email
    await axios.post(`${EMAIL_SERVICE_URL}/email/send`, {
      recipient: parseBody.data.userEmail,
      subject: "Order Confirmation",
      body: `Your order has been placed successfully. Order ID: ${order.id}, Your Order Total: ${grandTotal}`,
      source: "checkout",
    });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export default checkOut;
