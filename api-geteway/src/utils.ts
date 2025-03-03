import axios from "axios";
import { Express, Request, Response } from "express";

export const createHandler = (
  hostname: string,
  path: string,
  method: string
) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostname}${path}`;
      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });

      const { data } = await axios({
        method,
        url,
        data: req.body,
      });

      res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        res.status(error.response?.status || 500).json(error.response?.data);
      }
    }
  };
};

export const configureRoutes = (app: Express) => {};
