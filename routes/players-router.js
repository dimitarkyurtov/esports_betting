import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import playersQueries from '../db/queries/playersQueries.js';
import indicative from 'indicative';
import bcrypt from 'bcryptjs'
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        const players = await playersQueries.findAllPlayers();
        res.json(players);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const player = await playersQueries.findOnePlayerById(req.params.id);
        if (!player) {
            sendErrorResponse(req, res, 404, `player with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(player);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
    const player = req.body;
    try {
        await indicative.validator.validate(player, {
            name: 'required|string|min:1|max:50',
            position: 'required|string|min:1|max:20',
            photo: 'required|string|url',  
        });
        try {
            const r = await playersQueries.InsertPlayer(player);
            if (r._id) {
                res.status(201).location(`/api/players/${r._id}`).json(player);
            } else {
                sendErrorResponse(req, res, 400, `Unable to create player: ${player.name}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create player: ${player.name}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create player: ${player.name}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.put('/:id', verifyRole(['admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
    const old = await playersQueries.findOnePlayerById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `Player with ID=${req.params.id} does not exist`);
        return;
    }
    const player = req.body;
    console.log(player);
    if (old._id.toString() !== player._id) {
        sendErrorResponse(req, res, 400, `player ID=${player._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(player, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            name: 'required|string|min:1|max:50',
            position: 'required|string|min:1|max:20',
            photo: 'required|string|url',     
        });
        try {
            const r = await playersQueries.updateOnePlayer(req.params.id, player);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete player._id;
                console.log(`Updated player: ${JSON.stringify(player)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new player are the same.`);
                }
                res.status(201).location(`/api/players/${r._id}`).json(player)
            } else {
                sendErrorResponse(req, res, 500, `Unable to update player: ${player._id}: ${player.name}`);
            }
        } catch (err) {
            console.log(`Unable to update player: ${player._id}: ${player.name}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update player: ${player._id}: ${player.name}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await playersQueries.findOnePlayerById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `player with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await playersQueries.deleteOnePlayer(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete player: ${old._id}: ${old.name} `);
            sendErrorResponse(req, res, 500, `Unable to delete player: ${old._id}: ${old.name} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;