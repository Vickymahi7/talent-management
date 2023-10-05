"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PORT = process.env.PORT || 3000;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = require("dotenv");
const routeHandler_1 = __importDefault(require("./src/routes/routeHandler"));
const errorHandlerMiddleware_1 = __importDefault(require("./src/middlewares/errorHandlerMiddleware"));
const notFoundHandlerMiddleware_1 = __importDefault(require("./src/middlewares/notFoundHandlerMiddleware"));
(0, dotenv_1.config)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res, next) => {
    res.send("Welcome To Talent Management API");
});
// Routes
app.use("/api/v1", routeHandler_1.default);
app.use(notFoundHandlerMiddleware_1.default);
app.use(errorHandlerMiddleware_1.default);
app
    .listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
    .on("error", (error) => {
    console.error("Error in server setup:", error);
});
