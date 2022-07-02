import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from 'morgan';
import usersRouter from './routes/users-router.js';
import playersRouter from './routes/players-router.js';
import teamsRouter from './routes/teams-router.js';
import leaguesRouter from './routes/leagues-router.js';
import matchesRouter from './routes/matches-router.js';
import betsRouter from './routes/bets-router.js';
import authRouter from './routes/auth-router.js';
import { sendErrorResponse } from './routes/utils.js';
import MongoClient from 'mongodb/lib/mongo_client.js';
const url = 'mongodb://localhost:27017';
const db_name = 'esports_betting';

const app = express();
const port = 9000;


const corsOpts = {
    origin: 'http://localhost:3000'
}

if(!process.env.BLOGS_API_SECRET) {
    console.log("Error: BLOGS_API_SECRET environment variable should be set");
}

// apply express middleware
app.use(cors(corsOpts))
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }))

app.use(express.static('public'))
app
    .use('/api/users', usersRouter)
    .use('/api/players', playersRouter)
    .use('/api/teams', teamsRouter)
    .use('/api/leagues', leaguesRouter)
    .use('/api/matches', matchesRouter)
    .use('/api/bets', betsRouter)
    .use('/api/auth', authRouter);

app.use(function (err, req, res, next) {
    console.error(err.stack)
    sendErrorResponse(req, res, err.status || 500, `Server error: ${err.message}`, err);
})

try {
    await mongoose.connect('mongodb://localhost:27017/esports_betting');
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
  } catch (error) {
    console.log(error);
  }

// MongoClient.connect(url, { useUnifiedTopology: true }, function (err, con) {
//     if (err) throw err;
//     app.locals.db = con.db(db_name);
//     console.log(`Connection extablished to ${db_name}.`);
//     app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
// });

