import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpStatusCode from '../constants/HttpStatusCode';
import { config } from 'dotenv';

config();

const checkUserAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : '';

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, decodedToken) => {
      if (err) {
        return res.sendStatus(HttpStatusCode.FORBIDDEN);
      } else {
        next();
      }
    });
  } else {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
  }
};

export default checkUserAuth;
