import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import matchesQueries from '../db/queries/matchesQueries.js';
import indicative from 'indicative';
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        const matches = await matchesQueries.findAllMatches();
        res.json(matches);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const match = await matchesQueries.findOneMatchById(req.params.id);
        if (!match) {
            sendErrorResponse(req, res, 404, `match with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(match);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid match data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
    const match = req.body;
    try {
        await indicative.validator.validate(match, {
            leagueID: 'required|regex:^[0-9a-f]{24}$',
            opponents: 'required|array|min:2|max:2',
        });
        try {
            const r = await matchesQueries.InsertMatch(match);
            if (r._id) {
                res.status(201).location(`/api/matches/${r._id}`).json(match);
            } else {
                sendErrorResponse(req, res, 400, `Unable to create match: ${match.opponents}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create match: ${match.opponents}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create match: ${match.opponents}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.put('/:id', verifyRole(['admin', 'result_user']), async (req, res) => {
router.put('/:id', async (req, res) => {
    const old = await matchesQueries.findOneMatchById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `Match with ID=${req.params.id} does not exist`);
        return;
    }
    const match = req.body;
    console.log(match);
    if (old._id.toString() !== match._id) {
        sendErrorResponse(req, res, 400, `Match ID=${match._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(match, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            leagueID: 'required|regex:^[0-9a-f]{24}$',
            opponents: 'required|array|min:2|max:2',
        });
        try {
            if(match.winner){
                if(!match.opponents.includes(match.winner)){
                    sendErrorResponse(req, res, 400, `Invalid match data`);
                }
            }
            const r = await matchesQueries.updateOneMatch(req.params.id, match);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete match._id;
                console.log(`Updated match: ${JSON.stringify(match)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new match are the same.`);
                }
                res.status(201).location(`/api/matches/${r._id}`).json(match)
            } else {
                sendErrorResponse(req, res, 500, `Unable to update match: ${match._id}: ${match.opponents}`);
            }
        } catch (err) {
            console.log(`Unable to update match: ${match._id}: ${match.opponents}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update match: ${match._id}: ${match.opponents}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid match data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await matchesQueries.findOneMatchById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `Match with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await matchesQueries.deleteOneMatch(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete match: ${old._id}: ${old.opponents} `);
            sendErrorResponse(req, res, 500, `Unable to delete match: ${old._id}: ${old.opponents} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid matche data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;