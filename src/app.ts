import cors from 'cors';
import express, { Application } from 'express';
import routeHandler from './routes/routeHandler';
import errorHandler from './middlewares/errorHandlerMiddleware';
import notFoundHandler from './middlewares/notFoundHandlerMiddleware';
import dotenv from 'dotenv';
import { HttpInternalServerError } from './types/errors';
import { AppDataSource } from './data-source';
dotenv.config();
const app: Application = express();
const PORT: number | string = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/", (req, res, next) => {
      res.send("Welcome To Talent Management API");
    });

    // Routes
    app.use("/api/v1", routeHandler);

    app.use(notFoundHandler);
    app.use(errorHandler);

    app
      .listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      })
  })
  .catch((error) => {
    console.error(error)
    throw new HttpInternalServerError(`Something went wrong!`);
  });

