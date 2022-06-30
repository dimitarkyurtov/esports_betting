import {createSlice} from '@reduxjs/toolkit'

const pendingBetSlice = createSlice({
    name: 'pendingBet',
    initialState: {
        isActive: false,
        match: {},
        winner: {},
        coefficient: null,
        amount: null    
    },
    reducers:{
        disableBet(state, action){
            state.isActive = false;
            state.match = {};
            state.coefficient = null;
            state.amount = null;
        },
        showBet(state, action){
            state.isActive = true;
            state.match = action.payload.match;
            state.winner = action.payload.winner;
        }
    }
})

export const pendingBetActions = pendingBetSlice.actions;

export default pendingBetSlice;