import React, { useState } from 'react'
import '../css/PendingBet.css'
import { useDispatch, useSelector } from 'react-redux'
import { pendingBetActions } from '../store/pending-bet-slice';
import { userActions } from '../store/user-slice';
import { myBetsActions } from '../store/my-bets-slice';
import { notificationActions } from '../store/notification-slice';

export const PendingBet = ({pendingBet}) => {
    const dispatch = useDispatch();
    const myBets = useSelector(state => state.myBets)
    const [amount, setAmount] = useState(0);
    const [coefficient, setCoefficient] = useState(0);

    const cancelBet = () => {
        dispatch(pendingBetActions.disableBet())
    }

    const placeBet = async () => {
        if(localStorage.getItem('user-balance') < amount){
            dispatch(notificationActions.showNotification({
                message: `User balance: ${localStorage.getItem('user-balance')} is less than ${amount}`,
                type: 'warning',
                open: true
            }))
            return;
        }
        let body = {};
        body.owner = localStorage.getItem('user-ID');
        body.matchID = pendingBet.match._id;
        body.winnerChosenByOwner = pendingBet.winner.id;
        body.initialAmount = amount;
        body.coefficient = coefficient;
        const res = await fetch("http://localhost:9000/api/bets", {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
          },
        })
        const response = await res.json();
        console.log(res.status)
        if(Math.floor(res.status / 100) === 2 || Math.floor(res.status / 100) === 3){
            console.log("dsadsadasd")
            console.log(JSON.stringify(response))
            dispatch(notificationActions.showNotification({
              message: response.message,
              type: 'success',
              open: true
            }))
          }
        dispatch(userActions.decrementBalance({
            balance: amount
          }))
        localStorage.setItem('user-balance', localStorage.getItem('user-balance') - amount)
        
        const res2 = await fetch(`http://localhost:9000/api/bets/${localStorage.getItem('user-ID')}`, {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
            },
          });
          const data = await res2.json();
          dispatch(myBetsActions.updateMyBets({
            myBets: data,
          }))
        cancelBet();
    }

    console.log(pendingBet)

  return (
    <div className='pending-bet-container'>
        <div className='pending-bet-navbar'>
            <div className='pending-bet-header'>
                Bet
            </div>
            <div className='pending-bet-button'>
                <button className='pending-bet-close-button' onClick={cancelBet}>&#10006;</button>
            </div>
        </div>
        <div className='pending-bet-body'>
            <div className='pending-bet-first'>
                <div className='pending-bet-winner'>
                    {pendingBet.winner.name}
                </div>
                <div className='pending-bet-amount'>
                    <input className='pending-bet-amount' type="number" id="bet-amount" onChange={e => {setAmount(e.target.value);if(!e.target.value){setAmount(0);}}} placeholder='Amount'/>
                </div>
            </div>
            <div className='pending-bet-second'>
                <div className='pending-bet-match'>
                    {pendingBet.match.opponentsNames[0]} - {pendingBet.match.opponentsNames[1]}
                </div>
                <div className='pending-bet-coefficient'>
                    <input className='pending-bet-coefficient' type="number" id="bet-coefficient" onChange={e => {setCoefficient(e.target.value)}} placeholder='Coefficient'/>
                </div>
            </div>
            <div className='pending-bet-stake-button' onClick={placeBet}>
                <div className='pending-bet-button-text-1'>
                    STAKE
                </div>
                <div className='pending-bet-button-text-2'>
                    {amount} EUR
                </div>
            </div>
        </div>
    </div>
  )
}
