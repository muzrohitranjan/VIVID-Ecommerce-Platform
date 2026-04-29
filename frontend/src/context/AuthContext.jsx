import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const ADMIN_EMAIL = 'ammanurraj@gmail.com';
const ADMIN_PASSWORD = 'iimstc@4431';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios.get('http://localhost:5000/api/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
        }
      }).catch(() => {
        localStorage.removeItem('token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Special case for admin
      if (email === ADMIN_EMAIL) {
        if (password === ADMIN_PASSWORD) {
          const adminUser = {
            name: 'Admin',
            email,
            role: 'admin',
            dob: '1990-01-01',
            gender: 'Other',
            savedAddresses: ['Admin HQ, City, Country'],
            accountStatus: 'active',
          };
          setUser(adminUser);
          return adminUser;
        }
        return null;
      }

      // Regular login via API
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('token', response.data.token);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const signup = (name, email, password, phone, dob = '2000-01-01', gender = 'Male', savedAddresses = ['123 Main St, City, Country'], accountStatus = 'active') => {
    const newUser = { name, email, phone, role: 'user', dob, gender, savedAddresses, accountStatus };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
