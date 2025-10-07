import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
  const { getUserRole } = useAuth();
  const { t } = useTranslation();
  
  // Get user role from useAuth hook
  const userRole = getUserRole();
  
  // Redirect based on user role
  useEffect(() => {
    // You can add any additional logic here if needed
    console.log(`Redirecting user with role: ${userRole}`);
  }, [userRole]);

  // Default redirect paths based on user role
  const getRedirectPath = () => {
    switch(userRole) {
      case 'student':
        return '/student/dashboard';
      case 'instructor':
      case 'teacher':
        return '/teacher/dashboard';
      default:
        return '/login'; // Redirect to login if no role is set
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};

export default DashboardRedirect;
