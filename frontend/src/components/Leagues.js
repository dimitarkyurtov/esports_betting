import React from 'react'
import '../css/App.css';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { leaguesActions } from '../store/leagues-slice';
import { League } from './League';

export const Leagues = () => {
    const dispatch = useDispatch();
    const leagues = useSelector(state => state.leagues)
    useEffect(() => {
        const sendRequest = async () => {
            const res = await fetch('http://localhost:9000/api/leagues/');
            const data = await res.json();
            if(leagues.isFirstTime){
                data.forEach(league => {
                    league.isChecked = false;
                });
            }
            dispatch(leaguesActions.updateLeagues({leagues: data}))
        }
        sendRequest();
    }, [])
  return (
    <div className='main-flexbox-item main-flexbox-item-1'>
        {   
            leagues.leagues.map((league, key) => (
                <League leagueLogo={league.logo} leagueName={league.nickName} key={key} id={league._id}/>
            ))
        } 
    </div>
  )
}
