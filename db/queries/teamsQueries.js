import mongoose from 'mongoose';
import Teams from './../schemas/teamsSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var teamsQueries = {};

async function findAllTeams(){
    return await Teams.find();
}

async function InsertTeam(team){
    console.log(team)
    const newTeam = new Teams(team)
    console.log(newTeam);
    const newTeam2 = await newTeam.save(); 
    return newTeam2;
}

async function findOneTeamById(id){
    return await Teams.findOne({ _id: new ObjectID(id) });
}

async function deleteOneTeam(id){
    return await Teams.deleteOne({ _id: new ObjectID(id) });
}

async function updateOneTeam(id, team){
    return await Teams.updateOne({ _id: new ObjectID(id) }, { $set: team });
}


teamsQueries.findAllTeams = findAllTeams;
teamsQueries.findOneTeamById = findOneTeamById;
teamsQueries.InsertTeam = InsertTeam;
teamsQueries.updateOneTeam = updateOneTeam;
teamsQueries.deleteOneTeam = deleteOneTeam;

export default teamsQueries;