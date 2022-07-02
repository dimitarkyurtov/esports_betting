import React, { useEffect, useState } from 'react'
import logo from '../resources/logo.png';
import 'bulma/css/bulma.css';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../store/user-slice';
import { Notification } from './Notification';
import { notificationActions } from '../store/notification-slice';

const styleLink = {
    textDecoration: "none"
  }

export const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if(sessionStorage.getItem("jwt")){
      dispatch(userActions.setUser({
        name: localStorage.getItem('user-name'),
        role: localStorage.getItem('user-role'),
        balance: localStorage.getItem('user-balance'),
        id: localStorage.getItem('user-ID'),
      }))
    }
  }, [])

  const logout = () => {
    dispatch(userActions.unsetUser())
    setUsername("");
    setPassword("");
    sessionStorage.removeItem("jwt")
    localStorage.removeItem("user-name")
    localStorage.removeItem("user-role")
    localStorage.removeItem("user-balance")
    localStorage.removeItem("user-ID")
  }

  const login = async () => {
    try {

      let body = {};
      body.username = username;
      body.password = password;
      const res = await fetch("http://localhost:9000/api/auth/login/", {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json'
            },
          })
      
      const response = await res.json()
      if(Math.floor(response.code / 100) === 4 || Math.floor(response.code / 100) === 5){
        dispatch(notificationActions.showNotification({
          message: response.message,
          type: 'error',
          open: true
        }))
      }
      if(response.token){
        sessionStorage.setItem("jwt", response.token)
        localStorage.setItem("user-name", response.user.name)
        localStorage.setItem("user-role", response.user.role)
        localStorage.setItem("user-ID", response.user._id)
        localStorage.setItem("user-balance", response.user.balance)
        dispatch(userActions.setUser({
          name: response.user.name,
          role: response.user.role,
          balance: response.user.balance,
          id: response.user._id,
        }))
      }
    } catch(error) {
      console.log("Error" + error)
    }
  }

  const deposit = async () => {
    const res = await fetch(`http://localhost:9000/api/users/${localStorage.getItem("user-ID")}`);
    const user = await res.json();
    user.balance += 10;
    await fetch(`http://localhost:9000/api/users/${localStorage.getItem("user-ID")}`, {
      method: 'PUT',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    dispatch(userActions.setUser({
      name: user.name,
      role: user.role,
      balance: user.balance,
      id: user._id,
    }))
    localStorage.setItem('user-balance', parseFloat(localStorage.getItem('user-balance')) + 10)
  }

  const roundFloat = (n) => {
      return Math.round(n * 10) / 10
  }

  return (
    
    <div className='nav-flexbox-container'>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      <div className='nav-flexbox-item nav-flexbox-item-1'>

        <figure className='image is-16by9'>
          <img className="has-ratio" width="100%" src="https://upload.wikimedia.org/wikipedia/commons/7/74/EFbet_official_Logo_for_Wikipedia.png?20200503143156"/>
        </figure>
      </div>
      <div className='nav-flexbox-item nav-flexbox-item-2'>
        <div className='nav-flexbox-text'>
          <Link to="/" style={styleLink}><h1 className='title is-2 wt'>MATCHES</h1></Link>
        </div>
      </div>
      <div className='nav-flexbox-item nav-flexbox-item-3'>
        <div className='nav-flexbox-text'>
          <Link to="/bets" style={styleLink}><p className='title is-2 wt'>BETS</p></Link>
        </div>
      </div>
      {
        !sessionStorage.getItem('jwt') &&
        
        <div className='center-veritacally-div'>
          <div className='nav-flexbox-item nav-flexbox-item-4'>
              <div className='nav-flexbox-item-4-container'>
                <input className='login-username' type="text" id="login-username" placeholder='Username' onChange={e => {setUsername(e.target.value)}}/>
                <input className='login-password' type="text" id="login-username" placeholder='Password' onChange={e => {setPassword(e.target.value)}}/>
                <button className='login-button' onClick={login}>Login</button>
              </div>
              <div className='nav-flexbox-item-4-containerr'>
                <Link to="/register" style={styleLink}><button className='register-button'>Register</button></Link>
              </div>
          </div>
         </div>
      }
      {
        sessionStorage.getItem('jwt') &&
        <div className='center-veritacally-div center-hotizontally-div'>
          <div className='nav-flexbox-item nav-flexbox-item-4-2'>
            <div className='nav-item nav-left nav-name'>
              {user.name}
            </div>
            <div className='nav-item nav-right nav-logout'>
              <button className='logout-button' onClick={logout}>Logout</button>
            </div>
            <div className='nav-item nav-left nav-balance'>
              {roundFloat(user.balance)} EUR
            </div>
            <div className='nav-item nav-right nav-deposit'>
              <button className='logout-button' onClick={deposit}>Deposit</button>
            </div>
          </div>
        </div>
          
      }
    </div>
  )
}
