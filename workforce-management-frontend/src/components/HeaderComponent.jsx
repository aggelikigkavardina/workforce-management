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
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <NavLink
          className="navbar-brand"
          to={loggedIn ? (isAdminUser() ? '/employees' : '/profile') : '/'}
        >
          Workforce Management
        </NavLink>

        {loggedIn && (
          <>
            {/* Hamburger button */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <ul
                className="navbar-nav mb-2 mb-lg-0 position-lg-absolute start-lg-50 translate-middle-lg-x"
              >

                {isAdminUser() && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/home" className="nav-link">Home</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/employees" className="nav-link">Employees</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/shifts" className="nav-link">Schedule</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/messages" className="nav-link">Messages</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/me" className="nav-link">My Profile</NavLink>
                    </li>
                  </>
                )}

                {isEmployeeUser() && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/my-shifts" className="nav-link">My Schedule</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/messages" className="nav-link">Messages</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/profile" className="nav-link">My Profile</NavLink>
                    </li>
                  </>
                )}
              </ul>

              <div className="ms-lg-auto mt-2 mt-lg-0">
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default HeaderComponent;