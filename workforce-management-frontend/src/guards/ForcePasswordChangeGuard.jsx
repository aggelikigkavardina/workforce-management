import { Navigate, Outlet } from 'react-router-dom';
import { isEmployeeUser, mustChangePassword } from '../services/AuthService';

export default function ForcePasswordChangeGuard() {
  if (isEmployeeUser() && mustChangePassword()) {
    return <Navigate to='/change-password' replace />;
  }
  return <Outlet />;
}