import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useVideoStore } from '../stores/videoStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loadUser } = useUserStore();
  const { fetchActiveJobs } = useVideoStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
      // Restore active jobs on page load/refresh
      fetchActiveJobs();
    }
  }, [isAuthenticated, loadUser, fetchActiveJobs]);

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
