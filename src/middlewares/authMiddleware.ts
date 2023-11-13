import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpForbidden, HttpUnauthorized } from "../types/errors";
import dotenv from "dotenv";
import HttpStatusCode from "../types/httpStatusCode";

dotenv.config();

export const checkUserAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader ? authHeader.split(" ")[1] : "";

  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
      async (err, decodedToken) => {
        if (err) {
          const error = new HttpForbidden("Invalid Access Token");
          next(error);
          // return res.sendStatus(HttpStatusCode.FORBIDDEN);
        } else {
          const userId = (decodedToken as JwtPayload).user_id;
          const tenantId = (decodedToken as JwtPayload).tenant_id;
          req.headers.userId = userId;
          req.headers.tenantId = tenantId;
          next();
        }
      }
    );
  } else {
    const error = new HttpUnauthorized(
      "Unauthorized. Please login to continue"
    );
    next(error);
  }
};

export const requireUsers = (requiredTypes: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token!, process.env.ACCESS_TOKEN_SECRET!);

      const userTypeId = (decodedToken as any).user_type_id;

      if (requiredTypes.includes(userTypeId)) {
        next();
      } else {
        return next(new HttpForbidden("Access Denied"));
      }
    } catch (error) {
      return next(new HttpForbidden("Invalid access token"));
    }
  };
};
