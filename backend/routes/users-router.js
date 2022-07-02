import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
// const ObjectID = require('mongodb').ObjectID;
// const usersQueries = require('./../db/queries/usersQueries');
import usersQueries from '../db/queries/usersQueries.js';
// const indicative = require('indicative');
import indicative from 'indicative';
import bcrypt from 'bcryptjs'
// const bcrypt = require('bcryptjs');
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        // const users = await req.app.locals.db.collection('users').find().toArray();
        const users = await usersQueries.findAllUsers();
        res.json(users);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const user = await usersQueries.findOneUserById(req.params.id);
        if (!user) {
            sendErrorResponse(req, res, 404, `User with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(user);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid user data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.post('/', async (req, res) => {
    const user = req.body;
    try {
        await indicative.validator.validate(user, {
            username: 'required|string|min:5|max:50',
            password: 'required|string|min:5',
            name: 'required|string|min:5|max:50',
            role: 'in:admin,result_user,user',    
        });
        const salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(user.password, salt);
        try {
            const r = await usersQueries.InsertUser(user);
            if (r._id) {
                res.status(201).location(`/api/users/${r._id}`).json(user);
            } else {
                sendErrorResponse(req, res, 400, `User with same password already exists: ${user.username}: ${user.name}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create user: ${user.id}: ${user.name}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create user: ${user.username}: ${user.name}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid user data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.put('/:id', async (req, res) => {
    const old = await usersQueries.findOneUserById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `User with ID=${req.params.id} does not exist`);
        return;
    }
    const user = req.body;
    console.log(user);
    if (old._id.toString() !== user._id) {
        sendErrorResponse(req, res, 400, `User ID=${user._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(user, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            username: 'required|string|min:5|max:50',
            password: 'required|string|min:5',
            name: 'required|string|min:5|max:50',
            role: 'in:admin,result_user,user',    
        });
        try {
            const r = await usersQueries.updateOneUser(req.params.id, user);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete user._id;
                console.log(`Updated user: ${JSON.stringify(user)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new users are the same.`);
                }
                res.status(201).location(`/api/users/${r._id}`).json(user);
            } else {
                sendErrorResponse(req, res, 500, `Unable to update user: ${user._id}: ${user.name}`);
            }
        } catch (err) {
            console.log(`Unable to update user: ${user._id}: ${user.name}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update user: ${user._id}: ${user.name}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid user data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await usersQueries.findOneUserById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `User with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await usersQueries.deleteOneUser(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete user: ${old._id}: ${old.name} `);
            sendErrorResponse(req, res, 500, `Unable to delete user: ${old._id}: ${old.name} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid user data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;