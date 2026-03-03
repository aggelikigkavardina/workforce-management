import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Collapse from "bootstrap/js/dist/collapse";
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

  const collapseElRef = useRef(null);
  const collapseInstanceRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const el = collapseElRef.current;
    if (!el) return;

    // Create once, do not auto-toggle
    const instance = Collapse.getOrCreateInstance(el, { toggle: false });
    collapseInstanceRef.current = instance;

    const onShown = () => setIsOpen(true);
    const onHidden = () => setIsOpen(false);

    el.addEventListener("shown.bs.collapse", onShown);
    el.addEventListener("hidden.bs.collapse", onHidden);

    return () => {
      el.removeEventListener("shown.bs.collapse", onShown);
      el.removeEventListener("hidden.bs.collapse", onHidden);
    };
  }, []);

  const handleToggle = () => {
    const instance = collapseInstanceRef.current;
    if (!instance) return;
    instance.toggle();
  };

  const closeNavbar = () => {
    const instance = collapseInstanceRef.current;
    if (!instance) return;
    instance.hide();
  };

  const handleLogout = async () => {
    try {
      await logoutAPICall();
    } catch (e) {}

    // (optional) close dropdown on logout too
    closeNavbar();

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
        <NavLink className="navbar-brand" to={brandTarget}>
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
          <div ref={collapseElRef} className="collapse navbar-collapse" id="navbarContent">
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

            {/* Logout inside collapse (mobile: appears in dropdown, desktop: right side) */}
            <div className="ms-lg-auto mt-2 mt-lg-0">
              <button className="btn btn-danger btn-sm" onClick={handleLogout} type="button">
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