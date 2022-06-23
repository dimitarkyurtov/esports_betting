import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
// const indicative = require('indicative');
import indicative from 'indicative';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import secret from '../config/secret.js';
import usersQueries from '../db/queries/usersQueries.js';

const router = express.Router();

// Users API Feature
router.post('/login', async (req, res) => {
    const credentials = req.body;
    try {
        await indicative.validator.validate(credentials, {
            username: 'required|string|min:5',
            password: 'required|string|min:6'
        });
        try {
            const user = await usersQueries.findOneUserByUsername(credentials.username);
            // console.log(user)
            if (!user) {
                sendErrorResponse(req, res, 401,  `Username or password is incorrect`);
                return;
            }
            const passIsValid = await bcrypt.compare(credentials.password, user.password);
            if(!passIsValid) {
                sendErrorResponse(req, res, 401, `Username or password is incorrect`);
                return;
            }
            console.log( process.env.BLOGS_API_SECRET);
            const token = jwt.sign({id: JSON.stringify(user._id)}, "1335", {
                expiresIn: 1800 //expires in 30 minutes
            });
            delete user.password;
            res.status(200).json({auth: true, token, user});
            // res.status(200).json({auth: true, user});
        } catch (err) {
            console.log(`Unable to login: ${user._id}: ${user.name}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to login user: ${user._id}: ${user.name}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid user data: ${errors}`, errors);
    }



});

export default router;