import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { AUTH_SERVICE_URL } from "./config";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data } = await axios.post(
      `http://localhost:4003/auth/verify-token`,
      {
        token,
        headers: {
          ip: req.ip,
          "user-agent": req.headers["user-agent"],
        },
      }
    );

    req.headers["x-user-id"] = data.user.id;
    req.headers["x-user-email"] = data.user.email;
    req.headers["x-user-name"] = data.user.name;
    req.headers["x-user-role"] = data.user.role;
    req.headers["user-agent"] = req.headers["user-agent"];

    next();
  } catch (error) {
    console.log("[AUTH MIDDLEWARE] Error: ", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const mildlewares = { auth };

export default mildlewares;
