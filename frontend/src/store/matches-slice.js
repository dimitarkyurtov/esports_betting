import {createSlice} from '@reduxjs/toolkit'

const matchesSlice = createSlice({
    name: 'matches',
    initialState: {
        matches: []    
    },
    reducers:{
        updateMatches(state, action){
            state.matches = action.payload.matches;
        }
    }
})

export const matchesActions = matchesSlice.actions;

export default matchesSlice;