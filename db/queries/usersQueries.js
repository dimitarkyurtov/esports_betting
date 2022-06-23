import mongoose from 'mongoose';
import Users from './../schemas/usersSchema.js';
const ObjectID  = mongoose.Types.ObjectId;
var usersQueries = {};

async function findAllUsers(){
    return await Users.find();
}

async function InsertUser(user){
    console.log(user)
    const newUser = new Users(user)
    console.log(newUser);
    const newUser2 = await newUser.save(); 
    return newUser2;
}

async function findOneUserById(id){
    return await Users.findOne({ _id: new ObjectID(id) });
}

async function findOneUserByUsername(_username){
    return await Users.findOne({ username: _username });
}

async function deleteOneUser(id){
    return await Users.deleteOne({ _id: new ObjectID(id) });
}

async function updateOneUser(id, user){
    return await Users.updateOne({ _id: new ObjectID(id) }, { $set: user });
}


usersQueries.findAllUsers = findAllUsers;
usersQueries.findOneUserById = findOneUserById;
usersQueries.findOneUserByUsername = findOneUserByUsername;
usersQueries.InsertUser = InsertUser;
usersQueries.updateOneUser = updateOneUser;
usersQueries.deleteOneUser = deleteOneUser;

export default usersQueries;