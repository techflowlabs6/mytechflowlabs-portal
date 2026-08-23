import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const ADMIN_EMAIL = 'techflowlabs6@gmail.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in local storage first
    const savedUser = localStorage.getItem('mytechflow_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse local auth user', e);
      }
    }

    // If Supabase is configured, hook to real auth events
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('mytechflow_auth_user', JSON.stringify(session.user));
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.setItem('mytechflow_auth_user', JSON.stringify(session.user));
        } else {
          setUser(null);
          localStorage.removeItem('mytechflow_auth_user');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Quick or custom login as admin
  const login = async (email, password) => {
    if (!email) throw new Error('Email is required');
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password || 'defaultpassword123'
      });
      if (error) {
        // Fallback for demonstration if offline/custom
        if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
          const mockAdmin = { id: 'admin-techflow', email: ADMIN_EMAIL, role: 'admin' };
          setUser(mockAdmin);
          localStorage.setItem('mytechflow_auth_user', JSON.stringify(mockAdmin));
          return mockAdmin;
        }
        throw error;
      }
      return data.user;
    } else {
      // Local verification
      if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
        const mockAdmin = { id: 'admin-techflow', email: ADMIN_EMAIL, role: 'admin' };
        setUser(mockAdmin);
        localStorage.setItem('mytechflow_auth_user', JSON.stringify(mockAdmin));
        return mockAdmin;
      } else {
        throw new Error(`Access restricted. Only ${ADMIN_EMAIL} has administration privileges.`);
      }
    }
  };

  const loginAsAdminQuick = () => {
    const mockAdmin = { id: 'admin-techflow', email: ADMIN_EMAIL, role: 'admin' };
    setUser(mockAdmin);
    localStorage.setItem('mytechflow_auth_user', JSON.stringify(mockAdmin));
    return mockAdmin;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('mytechflow_auth_user');
  };

  // Check if current user is admin
  const isAdmin = Boolean(
    user?.email && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      login,
      loginAsAdminQuick,
      logout,
      adminEmail: ADMIN_EMAIL
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
