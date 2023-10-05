const PORT: number | string = process.env.PORT || 3000;
import cors from 'cors';
import express, { Application } from 'express';
const app: Application = express();
import { config } from 'dotenv';

import routeHandler from './src/routes/routeHandler';
import errorHandler from './src/middlewares/errorHandlerMiddleware';
import notFoundHandler from './src/middlewares/notFoundHandlerMiddleware';
config();


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
  .on("error", (error) => {
    console.error("Error in server setup:", error);
  });
