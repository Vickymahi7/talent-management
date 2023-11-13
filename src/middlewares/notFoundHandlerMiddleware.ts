import express, { Request, Response, NextFunction } from 'express';
import { HttpNotFound } from '../types/errors';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpNotFound("Not found");
  next(error);
};

export default notFoundHandler;
