import React, { useState, useEffect } from 'react'
import '../css/Bet.css'
import 'bulma/css/bulma.css';
import { useDispatch } from 'react-redux'

export const BetTaken = ({bet}) => {

    const dispatch = useDispatch();
    const [winner, setWinner] = useState({});
    const [match, setMatch] = useState({});
    const [team1, setTeam1] = useState({});
    const [team2, setTeam2] = useState({});
    const [amount, setAmount] = useState(null);

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

            
            let ind = bet.takers.findIndex(taker => taker.taker === localStorage.getItem('user-ID'))
            console.log("ind")
            console.log(ind)
            setAmount(bet.takers[ind].amount)
        }
        sendRequest();
    }, [])

    const roundFloat = (n) => {
        return Math.round(n * 10) / 10
    }

  return (
    <div className='bet-container'>
        <div className='bet-body'>
            <div className='bet-first'>
                <div className='bet-winner'>
                    {winner.nickName} @{roundFloat(bet.coefficient)}
                </div>
                <div className='bet-amount'>
                    <input className='bet-amount-2' type="number" id="bet-amount" disabled placeholder={"Win " + amount}/>
                </div>
            </div>
            <div className='bet-second'>
                <div className='bet-match'>
                    {team1.nickName} - {team2.nickName}
                </div>
                <div className='bet-coefficient'>
                    <input className='bet-coefficient-2' type="number" id="bet-coefficient"  disabled placeholder=''/>
                </div>
            </div>
        </div>
    </div>
  )
}
