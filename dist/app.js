"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routeHandler_1 = __importDefault(require("./routes/routeHandler"));
const errorHandlerMiddleware_1 = __importDefault(require("./middlewares/errorHandlerMiddleware"));
const notFoundHandlerMiddleware_1 = __importDefault(require("./middlewares/notFoundHandlerMiddleware"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
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
    console.error(error);
});
