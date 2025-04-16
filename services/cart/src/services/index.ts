import { INVENTORY_SERVICE_URL } from "@/config";
import redis from "@/redis";
import axios from "axios";

const ClearCart = async (sessionId: string) => {
  try {
    const data = await redis.hgetall(`carts:${sessionId}`);
    if (Object.keys(data).length === 0) {
      console.log("Cart is empty");
      return;
    }

    const items = Object.keys(data).map((key) => {
      const { inventoryId, quantity } = JSON.parse(data[key]) as {
        inventoryId: string;
        quantity: number;
      };
      return {
        inventoryId,
        quantity,
        productId: key,
      };
    });

    const requests = items.map(async (item) => {
      return axios.put(
        `${INVENTORY_SERVICE_URL}/inventorys/${item.inventoryId}`,
        {
          quantity: item.quantity,
          actionType: "IN",
        }
      );
    });

    await Promise.all(requests);
    console.log("Inventory updated successfully");

    await redis.del(`carts:${sessionId}`);
    await redis.del(`sessions:${sessionId}`);
    console.log("Cart cleared successfully");
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};

export default ClearCart;
