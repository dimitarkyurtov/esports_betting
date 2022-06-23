import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import betsQueries from '../db/queries/betsQueries.js';
import indicative from 'indicative';
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        const bets = await betsQueries.findAllBets();
        res.json(bets);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const bet = await betsQueries.findOneBetById(req.params.id);
        if (!bet) {
            sendErrorResponse(req, res, 404, `bet with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(bet);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid bet data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
    const bet = req.body;
    try {
        await indicative.validator.validate(bet, {
            owner: 'required|regex:^[0-9a-f]{24}$',
            matchID: 'required|regex:^[0-9a-f]{24}$',
            winnerChosenByOwner: 'required|regex:^[0-9a-f]{24}$',
            initialAmount: 'required',
            coefficient: 'required',
        });
        try {
            bet.currentAmount = bet.initialAmount;
            bet.isActive = true;
            const r = await betsQueries.InsertBet(bet);
            if (r._id) {
                res.status(201).location(`/api/bets/${r._id}`).json(bet);
            } else {
                sendErrorResponse(req, res, 400, `Unable to create bet: ${bet.initialAmount}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create bet: ${bet.initialAmount}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create bet: ${bet.initialAmount}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.put('/:id', verifyRole(['admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
    const old = await betsQueries.findOneBetById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `Bet with ID=${req.params.id} does not exist`);
        return;
    }
    const bet = req.body;
    console.log(bet);
    if (old._id.toString() !== bet._id) {
        sendErrorResponse(req, res, 400, `Bet ID=${bet._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(bet, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            owner: 'required|regex:^[0-9a-f]{24}$',
            matchID: 'required|regex:^[0-9a-f]{24}$',
            winnerChosenByOwner: 'required|regex:^[0-9a-f]{24}$',
            initialAmount: 'required',
            coefficient: 'required',
        });
        try {
            const r = await betsQueries.updateOneBet(req.params.id, bet);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete bet._id;
                console.log(`Updated bet: ${JSON.stringify(bet)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new bet are the same.`);
                }
                res.status(201).location(`/api/bets/${r._id}`).json(bet)
            } else {
                sendErrorResponse(req, res, 500, `Unable to update bet: ${bet._id}: ${bet.initialAmount}`);
            }
        } catch (err) {
            console.log(`Unable to update bet: ${bet._id}: ${bet.initialAmount}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update bet: ${bet._id}: ${bet.initialAmount}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid bet data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await betsQueries.findOneBetById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `Bet with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await betsQueries.deleteOneBet(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete bet: ${old._id}: ${old.nickName} `);
            sendErrorResponse(req, res, 500, `Unable to delete bet: ${old._id}: ${old.initialAmount} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid bet data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;