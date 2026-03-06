import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeMyPassword } from '../services/UserService';
import { isValidPassword } from '../helpers/ValidationHelper';
import { Eye, EyeOff } from 'lucide-react';

const ChangePasswordComponent = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [samePasswordError, setSamePasswordError] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const [error, setError] = useState(null);

  // field-level messages
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // when current password is wrong (server-side), highlight currentPassword input
  const [credentialsError, setCredentialsError] = useState(false);

  const navigator = useNavigate();

  const validate = () => {
    const e = { currentPassword: '', newPassword: '' };
    let ok = true;

    setSamePasswordError(false);
    setGeneralError('');

    const cur = currentPassword.trim();
    const nw = newPassword.trim();

    if (!cur) {
      e.currentPassword = 'Current password is required';
      ok = false;
    }
    if (!nw) {
      e.newPassword = 'New password is required';
      ok = false;
    } else if (!isValidPassword(nw)) {
      e.newPassword = 'Password must be 6-64 characters';
      ok = false;
    }

    if (cur && nw && cur === nw) {
      setSamePasswordError(true);
      setGeneralError('New password cannot be the same as the temporary password');
      e.currentPassword = '';
      e.newPassword = '';
      ok = false;
    }

    setFieldErrors(e);
    return ok;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    setError(null);
    setCredentialsError(false);

    // clear previous errors
    setFieldErrors({ currentPassword: '', newPassword: '' });

    if (!validate()) return;

    try {
      await changeMyPassword(currentPassword, newPassword);

      localStorage.setItem('mustChangePassword', 'false');
      navigator('/my-shifts');
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      // Try to detect 'wrong current password'
      // Works for 401/403 OR 400 with a meaningful message
      const msg = (data?.error || '').toLowerCase();

      const wrongCurrent =
        status === 401 ||
        status === 403 ||
        msg.includes('current password') ||
        msg.includes('temporary password') ||
        msg.includes('invalid password') ||
        msg.includes('bad credentials');

      if (wrongCurrent) {
        setCredentialsError(true);
        setFieldErrors((prev) => ({
          ...prev,
          currentPassword: 'Wrong temporary password'
        }));
        return;
      }

      setError(data?.error || 'Password change failed');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className='row w-100 justify-content-center'>
        <div className='card shadow-lg border-0 col-12 col-md-6 col-lg-4'>
          <h3 className='text-center mt-3'>Change Password</h3>

          <div className='card-body'>
            {error && <div className='alert alert-danger'>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Current Password */}
              <div className='form-group mb-2'>
                <label>Current Password:</label>

                <div className='input-group'>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className={`form-control ${
                      fieldErrors.currentPassword || credentialsError || samePasswordError ? 'is-invalid' : ''
                    }`}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setCredentialsError(false);
                      setSamePasswordError(false);
                      setGeneralError("");
                      setFieldErrors(prev => ({ ...prev, currentPassword: "" }));
                      setError(null);
                    }}
                    autoComplete='current-password'
                  />

                  <span
                    className='input-group-text'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowCurrent((prev) => !prev)}
                    title={showCurrent ? 'Hide' : 'Show'}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>

                  {fieldErrors.currentPassword && (
                    <div className='invalid-feedback d-block'>
                      {fieldErrors.currentPassword}
                    </div>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className='form-group mb-2'>
                <label>New Password:</label>

                <div className='input-group'>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={`form-control ${
                      fieldErrors.newPassword || samePasswordError ? 'is-invalid' : ''
                    }`}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setSamePasswordError(false);
                      setGeneralError('');
                      setFieldErrors(prev => ({ ...prev, newPassword: '' }));
                      setError(null);
                    }}
                    autoComplete='new-password'
                  />

                  {generalError && (
                    <div className='invalid-feedback d-block'>
                      {generalError}
                    </div>
                  )}

                  <span
                    className='input-group-text'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowNew((prev) => !prev)}
                    title={showNew ? 'Hide' : 'Show'}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>

                  {fieldErrors.newPassword && (
                    <div className='invalid-feedback d-block'>
                      {fieldErrors.newPassword}
                    </div>
                  )}
                </div>
              </div>

              <div className='d-grid mt-3'>
                <button type='submit' className='btn btn-success w-100'>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordComponent;