const express = require('express');
const app = express();
const cors = require('cors');
const swagger = require('./src/configs/swaggerConfig');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 3000;
const hrProfileRoutes = require('./src/routes/hrProfileRoutes');
const userRoutes = require('./src/routes/userRoutes');
const errorHandler = require('./src/middlewares/errorHandlerMiddleware');
const { checkUserAuth } = require('./src/middlewares/authMiddleware');

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swagger));

app.use('/api/v1/user', userRoutes);

app.use(checkUserAuth);
app.use('/api/v1/hrprofile', hrProfileRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});