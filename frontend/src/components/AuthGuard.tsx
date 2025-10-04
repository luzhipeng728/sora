import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loadUser } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
