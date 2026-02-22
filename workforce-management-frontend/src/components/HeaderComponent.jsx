import { NavLink, useNavigate } from 'react-router-dom';
import { isUserLoggedIn, logout, isAdminUser, isEmployeeUser, logoutAPICall } from '../services/AuthService';

const HeaderComponent = () => {

  const navigator = useNavigate();
  const loggedIn = isUserLoggedIn();

  const handleLogout = async () => {
    try {
      await logoutAPICall();
    } catch (e) {
    }

    logout();
    navigator('/');
  };

  return (
    <header>
      <nav className='navbar navbar-dark bg-dark px-3 position-relative'>

        <NavLink className='navbar-brand' to={loggedIn ? (isAdminUser() ? '/employees' : '/profile') : '/'}>
          Workforce Management
        </NavLink>

        {loggedIn && (
          <div
            className='d-flex gap-4'
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {isAdminUser() && (
              <>
                <NavLink
                  to='/employees'
                  className={({ isActive }) =>
                    'nav-link ' + (isActive ? 'text-warning' : 'text-light')
                  }
                >
                  Employees
                </NavLink>

                <NavLink
                  to='/schedule'
                  className={({ isActive }) =>
                    'nav-link ' + (isActive ? 'text-warning' : 'text-light')
                  }
                >
                  Schedule
                </NavLink>

                <NavLink
                  to='/messages'
                  className={({ isActive }) =>
                    'nav-link ' + (isActive ? 'text-warning' : 'text-light')
                  }
                >
                  Messages
                </NavLink>
              </>
            )}

            {isEmployeeUser() && (
              <NavLink
                to='/profile'
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'text-warning' : 'text-light')
                }
              >
                My Profile
              </NavLink>
            )}
          </div>
        )}

        <div className='ms-auto'>
          {loggedIn && (
            <button className='btn btn-danger btn-sm' onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

      </nav>
    </header>
  );
};

export default HeaderComponent;