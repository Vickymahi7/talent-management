import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import { AppDataSource } from "./data-source";
import errorHandler from "./middlewares/errorHandlerMiddleware";
import notFoundHandler from "./middlewares/notFoundHandlerMiddleware";
import routeHandler from "./routes/routeHandler";
dotenv.config();
const PORT: number | string = process.env.PORT || 3000;

export const main = async () => {
  try {
    await AppDataSource.initialize();
    const app: Application = express();
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

    app.listen(PORT, () => {
      console.log(`Server listening on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

main();
