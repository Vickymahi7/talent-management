import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpForbidden, HttpUnauthorized } from '../utils/errors';
import dotenv from 'dotenv';

dotenv.config();

const checkUserAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : '';

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, decodedToken) => {
      if (err) {
        const error = new HttpForbidden("Invalid Access Token");
        next(error);
      } else {
        const userId = (decodedToken as jwt.JwtPayload).user_id;
        const tenantId = (decodedToken as jwt.JwtPayload).tenant_id;
        req.headers.userId = userId;
        req.headers.tenantId = tenantId;
        next();
      }
    });
  } else {
    const error = new HttpUnauthorized("Unauthorized. Please login to continue");
    next(error);
  }
};

export default checkUserAuth;
