import express, { Request, Response, NextFunction } from 'express';
import { HttpNotFound } from '../utils/errors';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpNotFound("Not found");
  next(error);
};

export default notFoundHandler;
