import express, { Request, Response, NextFunction } from 'express';
import { HttpBadRequest } from '../utils/errors';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpBadRequest("Not found");
  next(error);
};

export default notFoundHandler;
