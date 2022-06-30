import {createSlice} from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: "",
        role: "" ,
        balance: null,
        id: null,   
    },
    reducers:{
        setUser(state, action){
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.balance = action.payload.balance;
            state.id = action.payload.id;
        },
        decrementBalance(state, action){
            state.balance -= action.payload.balance;
        },
        incrementBalance(state, action){
            state.balance += action.payload.balance;
        },
        unsetUser(state, action){
            state.name = "";
            state.role = "";
            state.balance = null;
            state.id = null;
        }
    }
})

export const userActions = userSlice.actions;

export default userSlice;