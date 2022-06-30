import {createSlice} from '@reduxjs/toolkit'

const leaguesSlice = createSlice({
    name: 'leagues',
    initialState: {
        leagues: [],
        isFirstTime: true    
    },
    reducers:{
        updateLeagues(state, action){
            state.leagues = action.payload.leagues;
            state.isFirstTime = false;
        },
        checkLeague(state, action){
            let ind = state.leagues.findIndex(league => league._id === action.payload.id)
            state.leagues[ind].isChecked = !state.leagues[ind].isChecked;
            state.isFirstTime = false;
        }
    }
})

export const leaguesActions = leaguesSlice.actions;

export default leaguesSlice;