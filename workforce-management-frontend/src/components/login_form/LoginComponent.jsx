import React from 'react'
import './LoginComponent.css'
import { FaLock, FaUser } from 'react-icons/fa'

function LoginComponent() {
  return (
    <div className='login-page'>
      <div className='wrapper'>
        <form action=''>
          <h1>Login</h1>
          <div className='input-box'>
            <input type='text' placeholder='Username'></input>
            <FaUser className='icon' />
          </div>
          <div className='input-box'>
            <input type='password' placeholder='Password'></input>
            <FaLock className='icon' />
          </div>
          <div className='remember-forgot'>
            <label><input type='checkbox' />Remember me</label>
            <a href='#'>Forgot password?</a>
          </div>
          <button type='submit'>Login</button>
        </form>
      </div>
    </div>
  )
}

export default LoginComponent