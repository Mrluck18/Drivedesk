import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Controlla se c'è un token salvato all'avvio
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        socketService.connect();
      } catch { 
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }  
    }   
    setLoading(false);
  }, []);


  // Funzione LOGIN
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { token, user } = await authAPI.login(email, password);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      socketService.connect();
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Funzione LOGOUT
  const logout = () => {
    console.log('Logout chiamato dal Context');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Value passato ai componenti
  const value = { 
    user, 
    isAuthenticated, 
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook per usare il Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
}
