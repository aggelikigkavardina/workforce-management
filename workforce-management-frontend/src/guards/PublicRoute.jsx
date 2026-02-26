import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserRole, mustChangePassword } from '../services/AuthService';

const PublicRoute = () => {
  const token = getToken();

  // not logged in -> allow access to public routes (Login)
  if (!token) {
    return <Outlet />;
  }

  // logged in -> redirect to role home
  const role = getUserRole();

  if (role === 'ROLE_ADMIN') {
    return <Navigate to = '/employees' replace />;
  }

  if (role === 'ROLE_EMPLOYEE') {
    if (mustChangePassword()) {
      return <Navigate to = '/change-password' replace />;
    }
    return <Navigate to = '/profile' replace />;
  }

  // fallback
  return <Navigate to = '/profile' replace />;
};

export default PublicRoute;