import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import HttpStatusCode from '../constants/HttpStatusCode';

const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    const statusCode = error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ status: statusCode, mesaage: error.message })
  } else {
    res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR)
  }
};

export default errorHandler;
