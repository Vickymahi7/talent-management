const express = require('express');
const app = express();
const cors = require('cors');

const port = 3000;
const contactRoutes = require('./routes/contactRoutes');
const educationRoutes = require('./routes/educationRoutes');
const addressRoutes = require('./routes/addressRoutes');
const projectRoutes = require('./routes/projectRoutes');
const workExperienceRoutes = require('./routes/workExperienceRoutes');
const hrProfileRoutes = require('./routes/hrProfileRoutes');
const userRoutes = require('./routes/userRoutes');
const publicRoutes = require('./routes/publicRoutes');
const errorHandler = require('./middlewares/errorHandlerMiddleware');
const { checkUserAuth } = require('./middlewares/authMiddleware');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/public', publicRoutes);

app.use(checkUserAuth);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/hrprofile', hrProfileRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/workexperience', workExperienceRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});