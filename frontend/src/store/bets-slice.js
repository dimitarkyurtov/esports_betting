import {createSlice} from '@reduxjs/toolkit'

const betsSlice = createSlice({
    name: 'bets',
    initialState: {
        bets: []    
    },
    reducers:{
        updateBets(state, action){
            state.bets = action.payload.bets;
        }
    }
})

export const betsActions = betsSlice.actions;

export default betsSlice;