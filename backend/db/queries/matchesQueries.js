import mongoose from 'mongoose';
import Matches from './../schemas/matchesSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var matchesQueries = {};

async function findAllMatches(){
    return await Matches.find();
}

async function findAllMatchesFiltered(leagues){
    return await Matches.find({leagueID: {$in: leagues.leagues}});
}

async function InsertMatch(match){
    const newMatch = new Matches(match)
    const newMatch2 = await newMatch.save(); 
    return newMatch2;
}

async function findOneMatchById(id){
    return await Matches.findOne({ _id: new ObjectID(id) });
}

async function deleteOneMatch(id){
    return await Matches.deleteOne({ _id: new ObjectID(id) });
}

async function updateOneMatch(id, match){
    return await Matches.updateOne({ _id: new ObjectID(id) }, { $set: match });
}


matchesQueries.findAllMatches = findAllMatches;
matchesQueries.findOneMatchById = findOneMatchById;
matchesQueries.InsertMatch = InsertMatch;
matchesQueries.updateOneMatch = updateOneMatch;
matchesQueries.deleteOneMatch = deleteOneMatch;
matchesQueries.findAllMatchesFiltered = findAllMatchesFiltered;

export default matchesQueries;