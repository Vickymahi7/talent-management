const express = require('express');
const app = express();
const cors = require('cors');
const swagger = require('./src/configs/swaggerConfig');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 3000;
const hrProfileRoutes = require('./src/routes/hrProfileRoutes');
const userRoutes = require('./src/routes/userRoutes');
const errorHandler = require('./src/middlewares/errorHandlerMiddleware');
const notFoundHandler = require('./src/middlewares/notFoundHandlerMiddleware');
const { checkUserAuth } = require('./src/middlewares/authMiddleware');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swagger));

app.use('/api/v1/user', userRoutes);

app.use(checkUserAuth);
app.use('/api/v1/hrprofile', hrProfileRoutes);

// handle unknown routes
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});