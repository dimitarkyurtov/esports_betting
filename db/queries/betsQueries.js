import mongoose from 'mongoose';
import Bets from './../schemas/betsSchema.js';
import Matches from './../schemas/matchesSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var betsQueries = {};

async function findAllBets(){
    return await Bets.find();
}

async function findAllBetsFiltered(leagues){
    const matches = await Matches.find({leagueID: {$in: leagues.leagues}});
    const matchesIDs = matches.map(match => match._id)
    return await Bets.find({matchID: {$in: matchesIDs}});
}

async function findAllBetsFilteredByMatch(matchID){
    return await Bets.find({matchID: {$in: matchID}});
}

async function findAllBetsOfUser(id){
    return await Bets.find({owner: new ObjectID(id)});
}

async function InsertBet(bet){
    console.log(bet)
    const newBet = new Bets(bet)
    console.log(newBet);
    const newBet2 = await newBet.save(); 
    return newBet2;
}

async function findOneBetById(id){
    return await Bets.findOne({ _id: new ObjectID(id) });
}

async function deleteOneBet(id){
    return await Bets.deleteOne({ _id: new ObjectID(id) });
}

async function updateOneBet(id, bet){
    return await Bets.updateOne({ _id: new ObjectID(id) }, { $set: bet });
}


betsQueries.findAllBets = findAllBets;
betsQueries.findOneBetById = findOneBetById;
betsQueries.InsertBet = InsertBet;
betsQueries.updateOneBet = updateOneBet;
betsQueries.deleteOneBet = deleteOneBet;
betsQueries.findAllBetsOfUser = findAllBetsOfUser;
betsQueries.findAllBetsFiltered = findAllBetsFiltered;
betsQueries.findAllBetsFilteredByMatch = findAllBetsFilteredByMatch;

export default betsQueries;