import mongoose from 'mongoose';
const { Schema } = mongoose;

const leagueSchema = new Schema({
    name: {type: String, unique: true, minLength: 5, maxLength: 50, required: true},
    nickName: {type: String, unique: true, minLength: 1, maxLength: 10, required: true},
    logo: {type: String, unique: true},
    teamIDs: [{ type: Schema.Types.ObjectId, ref: 'Teams' }],
    teamPoints: [{ 
        team: Schema.Types.ObjectId, 
        points: {type: Number, default: 0} 
    }],
    startDate: { type: Date },
    endDate: { type: Date },
});

const Leagues = mongoose.model('leagues', leagueSchema)
export default Leagues;