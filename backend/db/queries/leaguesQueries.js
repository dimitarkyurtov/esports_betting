import mongoose from 'mongoose';
import Leagues from './../schemas/leagueSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var leaguesQueries = {};

async function findAllLeagues(){
    return await Leagues.find();
}

async function InsertLeague(league){
    console.log(league)
    const newLeague = new Leagues(league)
    console.log(newLeague);
    const newLeague2 = await newLeague.save(); 
    return newLeague2;
}

async function findOneLeagueById(id){
    return await Leagues.findOne({ _id: new ObjectID(id) });
}

async function deleteOneLeague(id){
    return await Leagues.deleteOne({ _id: new ObjectID(id) });
}

async function updateOneLeague(id, league){
    return await Leagues.updateOne({ _id: new ObjectID(id) }, { $set: league });
}


leaguesQueries.findAllLeagues = findAllLeagues;
leaguesQueries.findOneLeagueById = findOneLeagueById;
leaguesQueries.InsertLeague = InsertLeague;
leaguesQueries.updateOneLeague = updateOneLeague;
leaguesQueries.deleteOneLeague = deleteOneLeague;

export default leaguesQueries;