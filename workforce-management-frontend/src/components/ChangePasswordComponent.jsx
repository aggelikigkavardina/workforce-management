import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeMyPassword } from '../services/UserService';
import { isValidPassword } from '../helpers/ValidationHelper';

const ChangePasswordComponent = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ currentPassword: '', newPassword: '' });

  const navigator = useNavigate();

  const validate = () => {
    const e = { currentPassword: '', newPassword: '' };
    let ok = true;

    if (!currentPassword.trim()) {
      e.currentPassword = 'Current password is required';
      ok = false;
    }
    if (!newPassword.trim()) {
      e.newPassword = 'New password is required';
      ok = false;
    } else if (!isValidPassword(newPassword)) {
      e.newPassword = 'Password must be 6-64 characters';
      ok = false;
    }

    setFieldErrors(e);
    return ok;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      await changeMyPassword(currentPassword, newPassword);

      localStorage.setItem('mustChangePassword', 'false');

      navigator('/profile');
    } catch (err) {
      const data = err?.response?.data;
      setError(data?.error || 'Password change failed');
    }
  };

  return (
    <div className='container'>
      <br /><br />
      <div className='row'>
        <div className='card col-md-6 offset-md-3'>
          <h3 className='text-center mt-3'>Change Password</h3>

          <div className='card-body'>
            {error && <div className='alert alert-danger'>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className='form-group mb-2'>
                <label>Current Password:</label>
                <input
                  type='password'
                  className={`form-control ${fieldErrors.currentPassword ? 'is-invalid' : ''}`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {fieldErrors.currentPassword && (
                  <div className='invalid-feedback'>{fieldErrors.currentPassword}</div>
                )}
              </div>

              <div className='form-group mb-2'>
                <label>New Password:</label>
                <input
                  type='password'
                  className={`form-control ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {fieldErrors.newPassword && (
                  <div className='invalid-feedback'>{fieldErrors.newPassword}</div>
                )}
              </div>

              <button className='btn btn-primary mt-2'>Save</button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordComponent;