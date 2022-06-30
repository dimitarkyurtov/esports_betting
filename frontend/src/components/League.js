import React from 'react'
import 'bulma/css/bulma.css';
import '../css/League.css';
import { useDispatch, useSelector } from 'react-redux';
import { leaguesActions } from '../store/leagues-slice';
import { matchesActions } from '../store/matches-slice';

export const League = ({leagueLogo, leagueName, id}) => {
  const dispatch = useDispatch();
  const leagues = useSelector(state => state.leagues)

  const changeLeague = async () => {
    console.log(leagueName, id)
    dispatch(leaguesActions.checkLeague({
      id: id
    }));
  }

  return (
    <div className='leagues-flexbox-item'>
      <div className='leagues-logo'>
        <figure className='image is-16by9'>
          <img className="has-ratio" width="100%" src={leagueLogo}/>
        </figure>
      </div>
      <div className='leagues-name'>
        <div className='leagues-name-inside'>
          {leagueName}
        </div>
      </div>
      <div className='leagues-checkbox'>
      <label className="checkbox">
        <input type="checkbox" className='check' onClick={changeLeague}/>
      </label>
      </div>
    </div>
  )
}
