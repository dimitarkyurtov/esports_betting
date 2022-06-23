import mongoose from 'mongoose';
import Bets from './../schemas/betsSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var betsQueries = {};

async function findAllBets(){
    return await Bets.find();
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

export default betsQueries;