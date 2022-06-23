import express from 'express';
import { sendErrorResponse } from './utils.js';
import { replace_id } from './utils.js';
import mongoose from 'mongoose'
const ObjectID  = mongoose.Types.ObjectId;
import teamsQueries from '../db/queries/teamsQueries.js';
import indicative from 'indicative';
import verifyToken from './verify-token.js';
import verifyRole from './verify-role.js';

const router = express.Router();

// Users API Feature
router.get('/', async (req, res) => {
    try {
        const teams = await teamsQueries.findAllTeams();
        res.json(teams);
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const team = await teamsQueries.findOneTeamById(req.params.id);
        if (!team) {
            sendErrorResponse(req, res, 404, `team with ID=${req.params.id} does not exist`);
            return;
        }
        res.json(team);
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid team data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.post('/', verifyRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
    const team = req.body;
    try {
        await indicative.validator.validate(team, {
            name: 'required|string|min:5|max:50',
            nickName: 'required|string|min:1|max:10',
            logo: 'required|string|url',  
            roster: 'required|array|min:5',
        });
        try {
            const r = await teamsQueries.InsertTeam(team);
            if (r._id) {
                res.status(201).location(`/api/teams/${r._id}`).json(team);
            } else {
                sendErrorResponse(req, res, 400, `Unable to create team: ${team.nickName}`);
            }
        } catch (err) {
            console.log(`Internal server error. Unable to create team: ${team.nickName}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to create team: ${team.nickName}`, err);
        }
    } catch(errors) {
        sendErrorResponse(req, res, 400, `Invalid player data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

// router.put('/:id', verifyRole(['admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
    const old = await teamsQueries.findOneTeamById(req.params.id);
    if (!old) {
        sendErrorResponse(req, res, 404, `Team with ID=${req.params.id} does not exist`);
        return;
    }
    const team = req.body;
    console.log(team);
    if (old._id.toString() !== team._id) {
        sendErrorResponse(req, res, 400, `Team ID=${team._id} does not match URL ID=${req.params._id}`);
        return;
    }
    try {
        await indicative.validator.validate(team, {
            _id: 'required|regex:^[0-9a-f]{24}$',
            name: 'required|string|min:5|max:50',
            nickName: 'required|string|min:1|max:10',
            logo: 'required|string|url',  
            roster: 'required|array|min:5',
        });
        try {
            const r = await teamsQueries.updateOneTeam(req.params.id, team);
            console.log(JSON.stringify(r))
            if (r.matchedCount >= 0) {
                delete team._id;
                console.log(`Updated team: ${JSON.stringify(team)}`);
                if (r.modifiedCount === 0) {
                    console.log(`The old and the new team are the same.`);
                }
                res.status(201).location(`/api/teams/${r._id}`).json(team)
            } else {
                sendErrorResponse(req, res, 500, `Unable to update team: ${team._id}: ${team.nickName}`);
            }
        } catch (err) {
            console.log(`Unable to update team: ${team._id}: ${team.nickName}`);
            console.error(err);
            sendErrorResponse(req, res, 500, `Unable to update team: ${team._id}: ${team.nickName}`, err);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid team data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

router.delete('/:id', async (req, res) => {
    const params = req.params;
    try {
        await indicative.validator.validate(params, { id: 'required|regex:^[0-9a-f]{24}$' });
        const old = await teamsQueries.findOneTeamById(req.params.id);
        if (!old) {
            sendErrorResponse(req, res, 404, `Team with ID=${req.params.id} does not exist`);
            return;
        }
        const r = await teamsQueries.deleteOneTeam(req.params.id);
        if (r.deletedCount === 1) {
            res.json(old);
        } else {
            console.log(`Unable to delete team: ${old._id}: ${old.nickName} `);
            sendErrorResponse(req, res, 500, `Unable to delete team: ${old._id}: ${old.nickName} `);
        }
    } catch (errors) {
        sendErrorResponse(req, res, 400, `Invalid team data: ${errors.map(e => e.message).join(', ')}`, errors);
    }
});

export default router;