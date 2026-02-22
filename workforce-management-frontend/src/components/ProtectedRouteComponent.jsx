import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserRole } from '../services/AuthService';

export default function ProtectedRouteComponent({ allowedRoles }) {
  const token = getToken();
  const role = getUserRole();

  if (!token) return <Navigate to='/' replace />;
  if (!role) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'ROLE_ADMIN' ? '/employees' : '/profile'} replace />;
  }

  return <Outlet />;
}