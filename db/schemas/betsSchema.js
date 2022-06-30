import mongoose from 'mongoose';
const { Schema } = mongoose;

const betsSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    matchID: { type: Schema.Types.ObjectId, ref: 'Matches', required: true },
    winnerChosenByOwner: { type: Schema.Types.ObjectId, ref: 'Teams', required: true },
    initialAmount: {type: Number, required: true},
    currentAmount: {type: Number, required: true},
    coefficient: {type: Number, required: true},
    takers: [{
        taker: { type: Schema.Types.ObjectId, ref: 'Users' },
        amount: { type: Number, default: 0}
    }],
    isActive: {type: Boolean, default: false}
});

const Bets = mongoose.model('bets', betsSchema)
export default Bets;