import React, { useState, useEffect } from 'react'
import '../css/Match.css'
import 'bulma/css/bulma.css';
import { useDispatch, useSelector } from 'react-redux'
import { pendingBetActions } from '../store/pending-bet-slice';

export const Match = ({match}) => {

    const dispatch = useDispatch();
    const [league, setLeague] = useState({});
    const [team1, setTeam1] = useState({});
    const [team2, setTeam2] = useState({});
    const leagues = useSelector(state => state.leagues)
    const matches = useSelector(state => state.matches)
    const user = useSelector(state => state.user)

    useEffect(() => {
        const sendRequest = async () => {
            const res = await fetch(`http://localhost:9000/api/leagues/${match.leagueID}`);
            const league = await res.json();
            setLeague(league);
            const res2 = await fetch(`http://localhost:9000/api/teams/${match.opponents[0]}`);
            const team1 = await res2.json();
            setTeam1(team1);
            const res3 = await fetch(`http://localhost:9000/api/teams/${match.opponents[1]}`);
            const team2 = await res3.json();
            setTeam2(team2);

            console.log(matches)
        }
        sendRequest();
    }, [leagues])

    const startBet = (id, name) => {
        dispatch(pendingBetActions.showBet({
            match: {
                ...match,
                opponentsNames: [
                    team1.nickName,
                    team2.nickName
                ]
            },
            winner: {
                id: id,
                name: name
            }
        }))
        
    }

    const resolveMatch = async (team, event) => {
        let body = {};
        body.winner = team._id;
        const res = await fetch(`http://localhost:9000/api/matches/resolve_match/${match._id}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`   
            },
        });
        const data = await res.json();
        event.stopPropagation()
    }


  return (
    <div>
    <div className='matches-flexbox-item'>
        <div className='matches-team-left' onClick={() => startBet(team1._id, team1.nickName)}>
            {
                user && ['admin', 'result_user'].includes(user.role) && 
                <div className='matches-left-win'>
                    <button onClick={e => {resolveMatch(team1, e)}}>
                        win
                    </button>
                </div>
            }  
            <div className='matches-team-left-name'>
                {team1.name}
            </div>
            <div className='matches-team-left-logo'>
                <figure className='image is-96x96'>
                    <img className="has-ratio" width="100%" src={team1.logo}/>
                </figure>
            </div>
        </div>
        <div className='matches-middle'>
            <div className='matches-middle-league'>
                {league.nickName}
            </div>
            <div className='matches-middle-vs'>
                VS
            </div>
        </div>
        <div className='matches-team-right' onClick={() => startBet(team2._id, team2.nickName)}>
            <div className='matches-team-right-logo'> 
                <figure className='image is-96x96'>
                    <img className="has-ratio" width="30%" src={team2.logo}/>
                </figure>
            </div>
            <div className='matches-team-right-name'>
                {team2.name}
            </div>
            {
                user && ['admin', 'result_user'].includes(user.role) && 
                <div className='matches-right-win'>
                    <button onClick={e => {resolveMatch(team2, e)}}>
                        win
                    </button>
                </div>
            }   
        </div>
    </div>
    </div>
  )
}
