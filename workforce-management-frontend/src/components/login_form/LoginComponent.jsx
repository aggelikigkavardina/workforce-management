import { useState } from 'react'
import { loginAPICall, saveToken, saveLoggedInUser } from '../../services/AuthService'
import { useNavigate } from 'react-router-dom'

const LoginComponent = () => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [errors, setErrors] = useState({
        username: '',
        password: ''
    })

  const navigator = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      loginAPICall(username, password)
        .then(response => {

          const token = response.data.accessToken
          const role = response.data.role

          saveToken(token)
          saveLoggedInUser(username, role)

          if (role === 'ROLE_ADMIN') {
            navigator('/employees')
          } else {
            navigator('/profile')
          }
        })
        .catch(error => {
          console.error(error)
        })
    }

    function validateForm() {
      let valid = true;

      const errorsCopy = {... errors}

      if(username.trim()) {
          errorsCopy.username = '';
      } else {
          errorsCopy.username = 'Email is required';
          valid = false;
      }

    if(password.trim()) {
          errorsCopy.password = '';
      } else {
          errorsCopy.password = 'Password is required';
          valid = false;
      }

      setErrors(errorsCopy);

      return valid;
    }
  }

  return (
    <div className='container'>
      <br /><br />
      <div className='row'>
        <div className='card col-md-6 offset-md-3'>
          <h3 className='text-center mt-3'>Login</h3>
          <div className='card-body'>
            <form onSubmit={handleSubmit}>
              <div className='form-group mb-2'>
                <label htmlFor='username'>Username (Email):</label>
                <input
                  id='username'
                  name='username'
                  type='text'
                  className={`form-control ${ errors.username ? 'is-invalid': ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete='username'
                />
                {errors.username && <div className='invalid-feedback'> {errors.username} </div>}
              </div>
              <div className='form-group mb-2'>
                <label htmlFor='password'>Password:</label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  className={`form-control ${ errors.password ? 'is-invalid': ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                {errors.password && <div className='invalid-feedback'> {errors.password} </div>}
              </div>
              <button className='btn btn-success' style={{marginTop: '10px'}}>Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent