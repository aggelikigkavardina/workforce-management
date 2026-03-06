import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  isUserLoggedIn,
  logout,
  isAdminUser,
  isEmployeeUser,
  logoutAPICall
} from "../services/AuthService";
import { Menu } from "lucide-react";

const HeaderComponent = () => {
  const navigator = useNavigate();
  const loggedIn = isUserLoggedIn();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // whenever auth changes, force menu closed
    setIsOpen(false);
  }, [loggedIn]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAPICall();
    } catch (e) {}

    setIsOpen(false);
    logout();
    navigator("/");
  };

  const brandTarget = loggedIn
    ? isAdminUser()
      ? "/shifts"
      : "/my-shifts"
    : "/";

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <NavLink className="navbar-brand" to={brandTarget} onClick={closeNavbar}>
          Workforce Management
        </NavLink>

        {loggedIn && (
          <button
            className="navbar-toggler"
            type="button"
            onClick={handleToggle}
            aria-controls="navbarContent"
            aria-expanded={isOpen ? "true" : "false"}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>
        )}

        {loggedIn && (
          <div
            id="navbarContent"
            className={`navbar-collapse ${isOpen ? "show" : "collapse"} d-lg-flex`}
          >
            <ul className="navbar-nav mb-2 mb-lg-0 position-lg-absolute start-lg-50 translate-middle-lg-x">
              {isAdminUser() && (
                <>
                  <li className="nav-item">
                    <NavLink to="/shifts" className="nav-link" onClick={closeNavbar}>
                      Schedule
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/employees" className="nav-link" onClick={closeNavbar}>
                      Employees
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/messages" className="nav-link" onClick={closeNavbar}>
                      Messages
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/profile" className="nav-link" onClick={closeNavbar}>
                      Profile
                    </NavLink>
                  </li>
                </>
              )}

              {isEmployeeUser() && (
                <>
                  <li className="nav-item">
                    <NavLink to="/my-shifts" className="nav-link" onClick={closeNavbar}>
                      Schedule
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/messages" className="nav-link" onClick={closeNavbar}>
                      Messages
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/profile" className="nav-link" onClick={closeNavbar}>
                      Profile
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            <div className="ms-lg-auto mt-2 mt-lg-0">
              <button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderComponent;