import { useState } from 'react'
import { loginAPICall, saveToken, saveLoggedInUser } from '../../services/AuthService'
import { useNavigate } from 'react-router-dom'
import { isValidEmail, isValidPassword } from '../../helpers/ValidationHelper'
import { Eye, EyeOff } from 'lucide-react';

const LoginComponent = () => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState({
        username: '',
        password: '',
        general: ''
    })

    const [credentialsError, setCredentialsError] = useState(false);

  const navigator = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      loginAPICall(username, password)
        .then(response => {

          const token = response.data.accessToken
          const role = response.data.role
          const mustChange = response.data.mustChangePassword

          saveToken(token)
          saveLoggedInUser(username, role, mustChange)

          if (role === 'ROLE_EMPLOYEE' && mustChange) {
            navigator('/change-password')
          } else if (role === 'ROLE_ADMIN') {
            navigator('/shifts')
          } else {
            navigator('/my-shifts')
          }
        }).catch(error => {
            console.log("LOGIN ERROR FULL:", error);
            console.log("STATUS:", error?.response?.status);
            console.log("DATA:", error?.response?.data);
            console.log("HEADERS:", error?.response?.headers);

            const status = error?.response?.status;
            if (status === 401 || status === 403) {
              setCredentialsError(true);
              setErrors(prev => ({
                ...prev,
                general: 'Wrong email or password'
              }));
              return;
            }
            console.log('LOGIN ERROR:', {
              status: error?.response?.status,
              data: error?.response?.data});
        })
    }

    function validateForm() {
      let valid = true;

      const errorsCopy = { username: "", password: "", general: "" };

      if (!username.trim()) {
        errorsCopy.username = "Email is required";
        valid = false;
      } else if (!isValidEmail(username.trim())) {
        errorsCopy.username = "Invalid email format";
        valid = false;
      }

      if (!password.trim()) {
        errorsCopy.password = "Password is required";
        valid = false;
      } else if (!isValidPassword(password.trim())) {
        errorsCopy.password = 'Wrong email or password';
        valid = false;
      }

      setErrors(errorsCopy);
      return valid;
    }
  }

  return (
    <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className='row w-100 justify-content-center'>
        <div className='card shadow-lg border-0 col-12 col-md-6 col-lg-4'>
          <h3 className='text-center mt-3'>Sign in</h3>
          <div className='card-body'>
            <form onSubmit={handleSubmit}>
              <div className='form-group mb-2'>
                <label htmlFor='username'>Username (Email):</label>
                <input
                  id='username'
                  name='username'
                  type='text'
                  className={`form-control ${(errors.username || credentialsError) ? "is-invalid" : ""}`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setCredentialsError(false);
                    setErrors(prev => ({ ...prev, general: "" }));
                  }}
                  autoComplete='username'
                />
                {errors.username && !credentialsError && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>
              <div className="form-group mb-2">
                <label htmlFor="password">Password:</label>

                <div className="input-group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${(errors.password || credentialsError) ? "is-invalid" : ""}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setCredentialsError(false);
                      setErrors(prev => ({ ...prev, general: "" }));
                    }}
                    autoComplete="current-password"
                  />

                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>

                  {errors.general && (
                    <div className="invalid-feedback d-block">
                      {errors.general}
                    </div>
                  )}

                  {errors.password && !errors.general && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
              <div className='d-grid mt-3'>
                <button type='submit' className='btn btn-success w-100'>
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent