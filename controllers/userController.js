const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let userList = require('../models/userList.json');
let userIdCount = 1;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: APIs for Managing Users
 * /user/login:
 *   post:
 *     summary: User Login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_id:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email_id
 *               - password
 *             example:
 *               email_id: demouser@demo.com
 *               password: demo123
 *     responses:
 *       200:
 *         description: User Successfully Logged In
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Incorrect Email ID / Password
 */
const userLogin = async (req, res, next) => {
    try {
        let user = req.body;
        if (!user.email_id || user.email_id == '') {
            res.status(400).json({ message: 'Email ID is required' });
        }
        else if (!user.password || user.password == '') {
            res.status(400).json({ message: 'Password is required' });
        }
        else {
            if (userList.length > 0 && user.email_id) {
                let userData = userList.find(data => data.email_id == user.email_id);
                if (userData && userData.email_id) {
                    const isPaswordMatched = await bcrypt.compare(user.password, userData.password);
                    if (isPaswordMatched) {
                        const accessToken = jwt.sign({ user_id: userData.user_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 30 });
                        return res.status(200).json({ accessToken: accessToken });
                    }
                }
            }
            res.status(401).json({ message: 'Incorrect Email ID / Password' });
        }
    } catch (error) {
        next(error);
    }
}


/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Add New User Account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_type_id:
 *                 type: number
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               email_id:
 *                 type: string
 *               created_by_id:
 *                 type: number
 *               status_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *               last_access:
 *                 type: string
 *               created_dt:
 *                 type: string
 *               last_updated_dt:
 *                 type: string
 *             required:
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               user_type_id: null
 *               user_name: Demo User
 *               password: demo123
 *               email_id: demouser@demo.com
 *               created_by_id: null
 *               status_id: null
 *               active: 1
 *               last_access: null
 *               created_dt: null
 *               last_updated_dt: null
 *     responses:
 *       201:
 *         description: Record Created.
 *       400:
 *         description: Bad Request.
 *       409:
 *         description: Conflict.
 *       500:
 *         description: Server error
 */
const userAdd = async (req, res, next) => {
    try {
        if (!req.body.user_name || req.body.user_name == '') {
            res.status(400).json({ message: 'User name is required' });
        }
        else if (!req.body.email_id || req.body.email_id == '') {
            res.status(400).json({ message: 'Email ID is required' });
        }
        else if (!req.body.password || req.body.password == '') {
            res.status(400).json({ message: 'Password is required' });
        }
        else {
            let isUserExists = userList.some(item => item.email_id === req.body.email_id);
            if (isUserExists) return res.status(409).json({ message: 'Email Id aleady exists' });
            userIdCount++;
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            let user = { ...req.body, user_id: userIdCount, password: hashedPassword };
            userList.push(user);

            res.status(201).json({ message: 'User Created Successfully' });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: List all Users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response.
 *       500:
 *         description: Server error
 */
const getUserList = async (req, res, next) => {
    try {
        res.status(200).json({ userList });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update User Details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               user_type_id:
 *                 type: number
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               email_id:
 *                 type: string
 *               created_by_id:
 *                 type: number
 *               status_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *               last_access:
 *                 type: string
 *               created_dt:
 *                 type: string
 *               last_updated_dt:
 *                 type: string
 *             required:
 *               - user_id
 *               - user_name
 *               - email_id
 *             example:
 *               user_id: 1
 *               user_type_id: null
 *               user_name: Demo User
 *               password: demo123
 *               email_id: demouser@demo.com
 *               created_by_id: null
 *               status_id: null
 *               active: 1
 *               last_access: null
 *               created_dt: null
 *               last_updated_dt: null
 *     responses:
 *       200:
 *         description: Successful response.
 *       500:
 *         description: Server error
 */
const userUpdate = async (req, res, next) => {
    try {
        const { password, ...rest } = req.body;
        let user = rest;
        if (!req.body.user_name || req.body.user_name == '') {
            res.status(400).json({ message: 'User name is required' });
        }
        else if (!req.body.email_id || req.body.email_id == '') {
            res.status(400).json({ message: 'Email ID is required' });
        }
        else if (!req.body.password || req.body.password == '') {
            res.status(400).json({ message: 'Password is required' });
        }
        else {
            if (userList.length > 0 && user.user_id) {
                let userData = userList.find(data => data.user_id == user.user_id);
                if (userData && userData.user_id) {
                    userList.map(data => {
                        if (data.user_id == user.user_id) {
                            data = { ...data, ...user };
                        }
                        return data;
                    })
                    return res.status(200).json({ message: 'User Updated Successfully' });
                }
            }
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
}


/**
 * @swagger
 * /user/view/{id}:
 *   get:
 *     summary: Get User Details by User Id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response.
 *       404:
 *         description: Not Found.
 *       500:
 *         description: Server error
 */
const userView = async (req, res, next) => {
    try {
        let userId = req.params.id;
        if (userList.length > 0 && userId) {
            const user = userList.find(data => data.user_id == userId);
            if (user && user.user_id) {
                return res.status(200).json({ user });
            }
        }
        res.status(404).json({ message: 'User not found' });
    } catch (error) {
        next(error);
    }
}


/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Delete a User by User Id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response.
 *       404:
 *         description: Not Found.
 *       500:
 *         description: Server error
 */
const userDelete = async (req, res, next) => {
    let userId = req.params.id;
    try {
        if (userList.length > 0 && userId) {
            let userData = userList.find(data => data.user_id == userId);
            if (userData && userData.user_id) {
                userList = userList.filter(data => data.user_id != userId);
                return res.status(200).json({ message: 'User Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'User not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserList,
    userLogin,
    userAdd,
    userUpdate,
    userView,
    userDelete,
}