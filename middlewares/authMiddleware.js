const jwt = require('jsonwebtoken');
require('dotenv').config();

// check access token
const checkUserAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : '';
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(403).send('Unauthorized, please Login to continue');
            } else {
                next();
            }
        });
    } else {
        return res.status(401).send('Unauthorized, please Login to continue');
    }
};


module.exports = { checkUserAuth };