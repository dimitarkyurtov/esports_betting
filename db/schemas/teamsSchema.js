import mongoose from 'mongoose';
const { Schema } = mongoose;

const teamsSchema = new Schema({
    name: {type: String, unique: true, minLength: 5, maxLength: 50, required: true},
    nickName: {type: String, unique: true, minLength: 1, maxLength: 10, required: true},
    logo: {type: String, unique: true},
    roster: [{ type: Schema.Types.ObjectId, ref: 'Players' }],
});

const Teams = mongoose.model('teams', teamsSchema)
export default Teams;