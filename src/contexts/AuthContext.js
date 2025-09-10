import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    // Mock authentication - in real app, this would call your API
    const mockUser = {
      id: Date.now(),
      email,
      role,
      name: role === 'candidate' ? 'John Doe' : role === 'company' ? 'Tech Corp' : 'Admin User',
      avatar: null
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true };
  };

  const signup = async (userData) => {
    // Mock signup - in real app, this would call your API
    const mockUser = {
      id: Date.now(),
      ...userData,
      avatar: null
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
