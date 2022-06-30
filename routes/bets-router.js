import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import betsQueries from '../db/queries/betsQueries.js';
import usersQueries from '../db/queries/usersQueries.js';
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


router.post('/leagues', async (req, res) => {
    try {
        const leagues = req.body;
        const bets = await betsQueries.findAllBetsFiltered(leagues);
        res.json(bets);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:userId', verifyToken, async (req, res) => {
    console.log(req.userId)
    if(JSON.parse(req.userId) !== req.params.userId){
        sendErrorResponse(req, res, 404, `Ids do not match`);
        return;
    }
    const params = req.params;
    try {
        await indicative.validator.validate(params, { userId: 'required|regex:^[0-9a-f]{24}$' });
        const user = await usersQueries.findOneUserById(req.params.userId);
        if (!user) {
            sendErrorResponse(req, res, 404, `User with ID=${req.params.userId} does not exist`);
            return;
        }
        const bets = await betsQueries.findAllBetsOfUser(req.params.userId);
        res.status(200).json(bets);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid bet data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.get('/taken/:userId', verifyToken, async (req, res) => {
    console.log(req.userId)
    if(JSON.parse(req.userId) !== req.params.userId){
        sendErrorResponse(req, res, 404, `Ids do not match`);
        return;
    }
    const params = req.params;
    try {
        await indicative.validator.validate(params, { userId: 'required|regex:^[0-9a-f]{24}$' });
        const user = await usersQueries.findOneUserById(req.params.userId);
        if (!user) {
            sendErrorResponse(req, res, 404, `User with ID=${req.params.userId} does not exist`);
            return;
        }
        const bets = await betsQueries.findAllTakenBetsOfUser(req.params.userId);
        res.status(200).json(bets);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid bet data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', verifyToken, async (req, res) => {
    const bet = req.body;
    if(JSON.parse(req.userId) !== bet.owner){
        sendErrorResponse(req, res, 404, `Ids do not match`);
        return;
    }
    const userId = JSON.parse(req.userId);
    try {
        await indicative.validator.validate(bet, {
            owner: 'required|regex:^[0-9a-f]{24}$',
            matchID: 'required|regex:^[0-9a-f]{24}$',
            winnerChosenByOwner: 'required|regex:^[0-9a-f]{24}$',
            initialAmount: 'required',
            coefficient: 'required',
        });
        try {
            console.log(userId)
            const user = await usersQueries.findOneUserById(userId);
            console.log("first")
            if(!user){
                sendErrorResponse(req, res, 400, `Unable to create bet: ${bet.initialAmount}, no user with id ${userId}`);
                return;
            }
            if(user.balance < bet.initialAmount){
                sendErrorResponse(req, res, 400, `Unable to create bet: ${bet.initialAmount}, no sufficient funds for user with id ${userId}`);
                return;
            }
            console.log("first")
            user.balance -= bet.initialAmount;
            await usersQueries.updateOneUser(user._id, user)
            bet.currentAmount = bet.initialAmount;
            bet.isActive = true;
            const r = await betsQueries.InsertBet(bet);
            if (r._id) {
                res.status(201).location(`/api/bets/${r._id}`).json({bet, message: "Successfully created bet"});
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

router.put('/take_bet/:id', verifyToken , async (req, res) => {
    const userId = JSON.parse(req.userId);
    const betId = req.params.id
    const old = await betsQueries.findOneBetById(betId);
    if (!old) {
        sendErrorResponse(req, res, 404, `Bet with ID=${req.params.id} does not exist`);
        return;
    }
    let amountToDec = req.body.amount;
    let amount = parseFloat(req.body.amount) * parseFloat(old.coefficient);
    const user = await usersQueries.findOneUserById(userId)
    if (!user) {
        sendErrorResponse(req, res, 404, `User with ID=${userId} does not exist`);
        return;
    }
    if(old.currentAmount < amount) {
        amount = old.currentAmount
        amountToDec = parseFloat(amount) / parseFloat(old.coefficient)
    }
    if(user.balance < amount) {
        sendErrorResponse(req, res, 404, `User with ID=${userId} does not have sufficient funds to place a bet`);
        return;
    }
    let va = false;
    old.takers.forEach(taker => {
        if(taker.taker.toString() === userId){
            taker.amount = parseFloat(taker.amount) + parseFloat(amount)
            va = true
        }
    });
    if(!va){
        old.takers.push({taker: new ObjectID(userId), amount: amount})
    }
    old.currentAmount -= amount;
    user.balance = parseFloat(user.balance) - parseFloat(amountToDec);
    await usersQueries.updateOneUser(user._id, user)
    // console.log(old)
    try {
        const r = await betsQueries.updateOneBet(req.params.id, old);
        console.log(JSON.stringify(r))
        if (r.matchedCount >= 0) {
            delete old._id;
            console.log(`Updated bet: ${JSON.stringify(old)}`);
            if (r.modifiedCount === 0) {
                console.log(`The old and the new bet are the same.`);
            }
            res.status(201).location(`/api/bets/${r._id}`).json(old)
        } else {
            sendErrorResponse(req, res, 500, `Unable to update bet: ${old._id}: ${old.initialAmount}`);
        }
    } catch (err) {
        console.log(`Unable to update bet: ${old._id}: ${bet.initialAmount}`);
        console.error(err);
        sendErrorResponse(req, res, 500, `Unable to update bet: ${old._id}: ${old.initialAmount}`, err);
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