const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const cors = require("cors");

const routeHandler = require("./src/routes/routeHandler");
const errorHandler = require("./src/middlewares/errorHandlerMiddleware");
const notFoundHandler = require("./src/middlewares/notFoundHandlerMiddleware");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routeHandler);

app.use(notFoundHandler);
app.use(errorHandler);

app
  .listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    console.error("Error in server setup:", error);
  });
