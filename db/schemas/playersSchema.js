import mongoose from 'mongoose';
const { Schema } = mongoose;

const playersSchema = new Schema({
    name: {type: String, unique: true, minLength: 1, maxLength: 50, required: true},
    position: {type: String, minLength: 1, maxLength: 10},
    photo: {type: String, unique: true},
});

const Players = mongoose.model('players', playersSchema)
export default Players;