import React from 'react'
import '../css/App.css';
import { useDispatch, useSelector } from 'react-redux'
import { pendingBetActions } from '../store/pending-bet-slice';
import { myBetsActions } from '../store/my-bets-slice';
import { useState, useEffect } from 'react';
import { PendingBet } from './PendingBet';
import { Bet } from './Bet';
import { BetTaken } from './BetTaken'

export const Cart = () => {
    const dispatch = useDispatch();
    const myBets = useSelector(state => state.myBets)
    const isLoggedIn = useSelector(state => state.user.name)
    const userId = useSelector(state => state.user.id)
    const pendingBet = useSelector(state => state.pendingBet)
    const matches = useSelector(state => state.matches)
    const [myBetsTaken, setMyBetsTaken] = useState([])
    const bets = useSelector(state => state.bets)
  

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
          const res2 = await fetch(`http://localhost:9000/api/bets/taken/${userId}`, {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
            },
          });
          const data2 = await res2.json();
          setMyBetsTaken(data2)
          console.log("Here")
          console.log(data2)
      }
      if(userId){
        sendRequest();
      }
  }, [isLoggedIn, matches, bets])

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
              <div className='bets-owned-container'>
                <div className='my-bets'>
                      Bets Owned
                </div>
                {
                myBets.myBets.map((bet, key) => (
                  <Bet bet={bet} key={bet._id} />
                ))
                }
              </div>
              <div className='bets-taken-container'>
                <div className='my-bets'>
                      Bets Taken
                </div>
                {
                myBetsTaken.map((bet, key) => (
                  <BetTaken bet={bet} key={bet._id} />
                ))
                }
              </div>
            </div>
            
        }
    </div>
  )
}
