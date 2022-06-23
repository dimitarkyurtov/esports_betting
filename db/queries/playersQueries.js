import mongoose from 'mongoose';
import Players from './../schemas/playersSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var playersQueries = {};

async function findAllPlayers(){
    return await Players.find();
}

async function InsertPlayer(player){
    console.log(player)
    const newPlayer = new Players(player)
    console.log(newPlayer);
    const newPlayer2 = await newPlayer.save(); 
    return newPlayer2;
}

async function findOnePlayerById(id){
    return await Players.findOne({ _id: new ObjectID(id) });
}

async function deleteOnePlayer(id){
    return await Players.deleteOne({ _id: new ObjectID(id) });
}

async function updateOnePlayer(id, player){
    return await Players.updateOne({ _id: new ObjectID(id) }, { $set: player });
}


playersQueries.findAllPlayers = findAllPlayers;
playersQueries.findOnePlayerById = findOnePlayerById;
playersQueries.InsertPlayer = InsertPlayer;
playersQueries.updateOnePlayer = updateOnePlayer;
playersQueries.deleteOnePlayer = deleteOnePlayer;

export default playersQueries;