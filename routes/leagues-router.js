import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import leaguesQueries from '../db/queries/leaguesQueries.js';
import indicative from 'indicative';
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        const leagues = await leaguesQueries.findAllLeagues();
        res.json(leagues);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const league = await leaguesQueries.findOneLeagueById(req.params.id);
        if (!league) {
            sendErrorResponse(req, res, 404, `league with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(league);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid league data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
    const league = req.body;
    try {
        await indicative.validator.validate(league, {
            name: 'required|string|min:5|max:50',
            nickName: 'required|string|min:1|max:10',
            logo: 'required|string|url',  
            teamIDs: 'required|array|min:5',
        });
        try {
            if(!league.teamPoints){
                league.teamPoints = []
                league.teamIDs.forEach(teamID => {
                    league.teamPoints.push({"team": teamID, "points": 0})
                });
            }
            const r = await leaguesQueries.InsertLeague(league);
            if (r._id) {
                res.status(201).location(`/api/leagues/${r._id}`).json(league);
            } else {
                sendErrorResponse(req, res, 400, `Unable to create league: ${league.nickName}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create league: ${league.nickName}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create league: ${league.nickName}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.put('/:id', verifyRole(['admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
    const old = await leaguesQueries.findOneLeagueById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `League with ID=${req.params.id} does not exist`);
        return;
    }
    const league = req.body;
    console.log(league);
    if (old._id.toString() !== league._id) {
        sendErrorResponse(req, res, 400, `League ID=${league._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(league, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            name: 'required|string|min:5|max:50',
            nickName: 'required|string|min:1|max:10',
            logo: 'required|string|url',  
            teamIDs: 'required|array|min:5',
            teamPoints: 'required|array|min:5',
        });
        try {
            const r = await leaguesQueries.updateOneLeague(req.params.id, league);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete league._id;
                console.log(`Updated league: ${JSON.stringify(league)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new league are the same.`);
                }
                res.status(201).location(`/api/leagues/${r._id}`).json(league)
            } else {
                sendErrorResponse(req, res, 500, `Unable to update league: ${league._id}: ${league.nickName}`);
            }
        } catch (err) {
            console.log(`Unable to update league: ${league._id}: ${league.nickName}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update league: ${league._id}: ${league.nickName}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid league data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await leaguesQueries.findOneLeagueById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `League with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await leaguesQueries.deleteOneLeague(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete league: ${old._id}: ${old.nickName} `);
            sendErrorResponse(req, res, 500, `Unable to delete league: ${old._id}: ${old.nickName} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid league data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;