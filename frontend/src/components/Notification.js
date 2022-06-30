import React from 'react'
import {Alert} from '@mui/material'
import {useDispatch, useSelector} from 'react-redux'
import {notificationActions} from './store/notification-slice.js'

export const Notification = ({type, message}) => {
    const dispatch = useDispatch();
    const notification = useSelector(state => state.notification.notification)

    const handleClose = () => {
        dispatch(notificationActions.showNotification({
            open: false
        }))
    }
  return (
    <div>
        {
            notification && <Alert onClose={handleClose} severity={type}>{message}</Alert>
        }
    </div>
  )
}
