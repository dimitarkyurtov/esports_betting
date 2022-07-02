import mongoose from 'mongoose';
const { Schema } = mongoose;

const matchesSchema = new Schema({
    leagueID: { type: Schema.Types.ObjectId, ref: 'Leagues', required: true },
    opponents: [{ type: Schema.Types.ObjectId, ref: 'Teams' }],
    winner: { type: Schema.Types.ObjectId, ref: 'Teams' },
    startTime: { type: Date },
});

const Matches = mongoose.model('matches', matchesSchema)
export default Matches;