import React from 'react'
import '../css/App.css';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { matchesActions } from '../store/matches-slice';
import { Match } from './Match';

export const Matches = () => {
    const dispatch = useDispatch();
    const matches = useSelector(state => state.matches)
    const leagues = useSelector(state => state.leagues)
    

    useEffect(() => {
        const sendRequest = async () => {
            let body = {};
            body.leagues = leagues.leagues.filter(league => league.isChecked).map(league => league._id);
            console.log(body.leagues)
            const res = await fetch('http://localhost:9000/api/matches/leagues', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                  'Content-Type': 'application/json'    
                },
            });
            const data = await res.json();
            console.log(data)
            dispatch(matchesActions.updateMatches({matches: data}))
        }
        sendRequest();
    }, [leagues])

  return (
    <div className='main-flexbox-item main-flexbox-item-2'>
        {   
            matches.matches.map((match, key) => (
                <Match match={match} key={match._id} />
            ))
        }
    </div>
  )
}
