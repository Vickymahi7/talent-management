import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/errors";
import { HttpStatusCode } from "../types/enums";

const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    const statusCode = error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ status: statusCode, message: error.message });
  } else {
    const statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    res
      .status(statusCode)
      .json({ status: statusCode, message: "Something went wrong" });
    console.error(error);
  }
};

export default errorHandler;
