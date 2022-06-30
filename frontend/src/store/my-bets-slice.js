import {createSlice} from '@reduxjs/toolkit'

const myBetsSlice = createSlice({
    name: 'myBets',
    initialState: {
        myBets: []
    },
    reducers:{
        updateMyBets(state, action){
            state.myBets = action.payload.myBets;
        }
    }
})

export const myBetsActions = myBetsSlice.actions;

export default myBetsSlice;