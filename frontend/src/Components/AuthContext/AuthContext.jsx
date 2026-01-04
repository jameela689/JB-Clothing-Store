import { useState, createContext, useContext, useCallback, useEffect } from "react";
import { authAPI } from '../../services/api'

export const AuthContext = createContext();
console.log("what createCOntext returns = ",AuthContext)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(()=>{
  //   return localStorage.getItem('authToken')!== null;
  // });
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setLoading(false); // No token = not logged in
        return;
      }

      try {
        // Verify token with backend
        const response = await authAPI.verifyToken();
        // ✅ Handle response format from backend
        if (response?.data?.user ) {
          setUser(response.data.user);
          console.log('Session restored:', response.data.user, response.data.user.email);
        } else {
          // ⚠️ Token exists but no user data returned
          console.warn('Token verification succeeded but no user data');
          localStorage.removeItem('authToken');
          setUser(null);
        }

      } catch (err) {
        console.error('Token verification failed:', err);
        // Token invalid/expired - clean up
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false); // ✅ Auth check complete
      }
    };
    initializeAuth();
  }, []); // Run once on mount

  const register = useCallback(async (fullName, email, password, phoneNumber, address) => {
    try {
      setError(null);
      const response = await authAPI.register({ fullName, email, password, phoneNumber, address });
      // Store token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      console.log("inside login response = ",response.data.user)
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clean up local state
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    setError,
    isLoggedIn: !!user,
 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )

};

export const useAuth = () => useContext(AuthContext);