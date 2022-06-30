import {configureStore} from '@reduxjs/toolkit'
import betsSlice from './bets-slice'
import leaguesSlice from './leagues-slice'
import matchesSlice from './matches-slice'
import myBetsSlice from './my-bets-slice'
import notificationSlice from './notification-slice'
import pendingBetSlice from './pending-bet-slice'
import userSlice from './user-slice'

const store = configureStore({
    reducer: {
        notification: notificationSlice.reducer,
        leagues: leaguesSlice.reducer,
        matches: matchesSlice.reducer,
        pendingBet: pendingBetSlice.reducer,
        user: userSlice.reducer,
        myBets: myBetsSlice.reducer,
        bets: betsSlice.reducer
    }
})

export default store