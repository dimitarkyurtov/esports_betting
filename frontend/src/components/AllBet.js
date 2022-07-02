import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'bulma/css/bulma.css';
import '../css/AllBet.css'
import { userActions } from '../store/user-slice';
import { myBetsActions } from '../store/my-bets-slice';
import { betsActions } from '../store/bets-slice';
import { notificationActions } from '../store/notification-slice';

export const AllBet = ({bet}) => {

    const dispatch = useDispatch();
    const [winner, setWinner] = useState({});
    const [match, setMatch] = useState({});
    const [team1, setTeam1] = useState({});
    const [team2, setTeam2] = useState({});
    const [owner, setOwner] = useState({});
    const [amount, setAmount] = useState(0);
    const isLoggedIn = useSelector(state => state.user.name)
    const bets = useSelector(state => state.bets)
    const leagues = useSelector(state => state.leagues)


    useEffect(() => {
        const sendRequest = async () => {
            const res = await fetch(`http://localhost:9000/api/teams/${bet.winnerChosenByOwner}`);
            const winner = await res.json();
            setWinner(winner);
            const res2 = await fetch(`http://localhost:9000/api/matches/${bet.matchID}`);
            const match = await res2.json();
            setMatch(match);
            const res3 = await fetch(`http://localhost:9000/api/teams/${match.opponents[0]}`);
            const team1 = await res3.json();
            setTeam1(team1);
            const res4 = await fetch(`http://localhost:9000/api/teams/${match.opponents[1]}`);
            const team2 = await res4.json();
            setTeam2(team2);
            const res5 = await fetch(`http://localhost:9000/api/users/${bet.owner}`);
            const owner = await res5.json();
            setOwner(owner);

            console.log(team1)
        }
        sendRequest();
    }, [])

    const takeBet = async () => {
        if(parseFloat(localStorage.getItem('user-balance')) < parseFloat(amount)){
            console.log(`User balance: ${localStorage.getItem('user-balance')} is less than ${amount}`)
            dispatch(notificationActions.showNotification({
                message: `User balance: ${localStorage.getItem('user-balance')} is less than ${amount}`,
                type: 'warning',
                open: true
            }))
            return;
        }
        let body = {};
        body.amount = amount;
        const res = await fetch(`http://localhost:9000/api/bets/take_bet/${bet._id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
          },
        })
        dispatch(userActions.decrementBalance({
            balance: amount
          }))
        localStorage.setItem('user-balance', localStorage.getItem('user-balance') - amount)
          let body2 = {};
          body2.leagues = leagues.leagues.filter(league => league.isChecked).map(league => league._id);
          console.log(body.leagues)
          const res3 = await fetch('http://localhost:9000/api/bets/leagues', {
              method: 'POST',
              body: JSON.stringify(body2),
              headers: {
                'Content-Type': 'application/json'    
              },
          });
          const data3 = await res3.json();
          console.log(data3)
          dispatch(betsActions.updateBets({bets: data3}))
    }

    const roundFloat = (n) => {
        return Math.round(n * 10) / 10
    }

  return (
    <div className='allbet-container'>
        <div className='allbet-role-1'>
            <div className=' allbet-winner'>
                {winner.nickName} @{roundFloat(bet.coefficient)} 
            </div>
            <div className='allbet-owner'>
                Owner: {owner.name}
            </div>
            <div className='allbet-center allbet-score'>
                <p className='bet-size'>Bet size: {roundFloat(bet.currentAmount)}/{roundFloat(bet.initialAmount)}</p>
            </div>  
            <div className='allbet-center allbet-betAmount'>
                <input className='bet-amount-2' type="number" id="bet-amountt" onChange={e => {setAmount(e.target.value);if(!e.target.value){setAmount(0);}}} placeholder='Amount to bet'/>
            </div>  
        </div>
        <div className='allbet-role-2'>
            <div className='allbet-teams'>
                {team1.name} - {team2.name}
            </div>
            <div className='allbet-takers'>
                Number of people taken the bet: {bet.takers.length}
            </div> 
            <div className='allbet-center allbet-takeBet'>
                {
                    isLoggedIn &&
                    <button className='my-button button is-small is-success' id='fkk' onClick={takeBet}>
                        takeBet
                    </button>  
                }
                {
                    !isLoggedIn &&
                    <button className='button is-success is-small my-button' disabled>
                        takeBet
                    </button> 
                }
            </div>
        </div>
    </div>
  )
}
