import mongoose from 'mongoose';
const { Schema } = mongoose;

const usersSchema = new Schema({
    username: {type: String, unique: true, minLength: 5, maxLength: 50, required: true},
    password: {type: String, unique: true, required: true},
    name: {type: String, minLength: 5, maxLength: 50, required: true},
    balance: {type: Number, default: 0},
    role: {type: String, default: 'user'},
    betsTaken: [{ type: Schema.Types.ObjectId, ref: 'Bets' }],
    betsOwned:
     [{ type: Schema.Types.ObjectId, ref: 'Bets' }],

},
    {
        methods:{
            
        }
    }
);

const Users = mongoose.model('users', usersSchema)
export default Users;