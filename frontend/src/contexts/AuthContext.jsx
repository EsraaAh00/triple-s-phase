import { createContext, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout as logoutAction, getProfile, validateToken } from '../store/slices/authSlice';

// Create the auth context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, profile, user_details, isAuthenticated, loading } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Initialize auth state from Redux
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // If we have a token but no user or profile in Redux, validate the token
          if (!user || !profile) {
            try {
              await dispatch(validateToken());
            } catch (error) {
              console.error('Token validation failed:', error);
              // If token validation fails, clear localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('userRole');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, [dispatch, user, profile]);

  // Login function that syncs with Redux
  const loginUser = useCallback(async (credentials) => {
    try {
      const result = await dispatch(login(credentials));
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [dispatch]);

  // Logout function that syncs with Redux
  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logoutAction());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  }, [dispatch, navigate]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!profile) return false;
    const userRole = profile.status?.toLowerCase() || user_details?.type?.toLowerCase();
    return userRole === role || userRole === 'admin';
  }, [profile, user_details]);

  // Check if user has any of the required roles
  const hasAnyRole = useCallback((requiredRoles) => {
    if (!profile) return false;
    const userRole = profile.status?.toLowerCase() || user_details?.type?.toLowerCase();
    return requiredRoles.includes(userRole) || userRole === 'admin';
  }, [profile, user_details]);

  // Get user role
  const getUserRole = useCallback(() => {
    if (!profile) return 'guest';
    return profile.status?.toLowerCase() || user_details?.type?.toLowerCase() || 'student';
  }, [profile, user_details]);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Expose the auth state and methods
  const value = {
    user,
    profile,
    user_details,
    isAuthenticated,
    loading,
    login: loginUser,
    logout: logoutUser,
    hasRole,
    hasAnyRole,
    getUserRole,
    getAuthToken,
    updateUser: (userData) => {
      // This is a no-op since we're using Redux for state management
      // The actual update should be done through Redux actions
      console.warn('updateUser is not implemented. Use Redux actions instead.');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
