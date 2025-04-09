import { REDIS_HOST, REDIS_PORT } from "@/config";
import { Redis } from "ioredis";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const CHANNEL_KEY = "__keyevent@0__:expired";

redis.config("SET", "notify-keyspace-events", "Ex");
redis.subscribe(CHANNEL_KEY);
redis.on("message", async (channel, message) => {
  if (channel === CHANNEL_KEY) {
    console.log("Key expired", message);
  }
});
