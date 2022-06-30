import React from 'react'
import '../css/App.css';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { betsActions } from '../store/bets-slice';
import { AllBet } from './AllBet';

export const Bets = () => {
    const dispatch = useDispatch();
    const bets = useSelector(state => state.bets)
    const leagues = useSelector(state => state.leagues)

    useEffect(() => {
        const sendRequest = async () => {
            let body = {};
            body.leagues = leagues.leagues.filter(league => league.isChecked).map(league => league._id);
            console.log(body.leagues)
            const res = await fetch('http://localhost:9000/api/bets/leagues', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                  'Content-Type': 'application/json'    
                },
            });
            const data = await res.json();
            console.log(data)
            dispatch(betsActions.updateBets({bets: data}))
        }
        sendRequest();
    }, [leagues])

  return (
    <div className='main-flexbox-item main-flexbox-item-2'>
        {   
            bets.bets.map((bet, key) => (
                <AllBet bet={bet} key={bet._id}/>
            ))
        }
    </div>
  )
}
