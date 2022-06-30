import React from 'react'
import '../css/App.css';
import { useDispatch, useSelector } from 'react-redux'
import { pendingBetActions } from '../store/pending-bet-slice';
import { myBetsActions } from '../store/my-bets-slice';
import { useState, useEffect } from 'react';
import { PendingBet } from './PendingBet';
import { Bet } from './Bet';

export const Cart = () => {
    const dispatch = useDispatch();
    const myBets = useSelector(state => state.myBets)
    const isLoggedIn = useSelector(state => state.user.name)
    const userId = useSelector(state => state.user.id)
    const pendingBet = useSelector(state => state.pendingBet)
  

    useEffect(() => {
      const sendRequest = async () => {
          const res = await fetch(`http://localhost:9000/api/bets/${userId}`, {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
            },
          });
          const data = await res.json();
          dispatch(myBetsActions.updateMyBets({
            myBets: data,
          }))
      }
      if(userId){
        sendRequest();
      }
  }, [isLoggedIn])

  return (
    <div className='main-flexbox-item main-flexbox-item-3'>
        {
            pendingBet.isActive && isLoggedIn &&
            <PendingBet pendingBet={pendingBet}/>
        }
        {
             !pendingBet.isActive && isLoggedIn 
            //  && console.log(myBets)
             && 
             
            <div>
              <div className='my-bets'>
                    My Bets
              </div>
              {
              myBets.myBets.map((bet, key) => (
                <Bet bet={bet} key={key} />
              ))
              }
            </div>
        }
    </div>
  )
}
