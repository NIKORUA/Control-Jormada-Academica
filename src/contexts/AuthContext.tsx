
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '@/types/auth';
import { fetchUserProfile } from '@/services/userProfileService';
import { useAuthOperations } from '@/hooks/useAuthOperations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const { login, signUp, logout } = useAuthOperations(setUser, setSession, setLoading);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state...');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        console.log('Initial session:', initialSession ? 'Found' : 'Not found');
        
        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            try {
              const profile = await fetchUserProfile(initialSession.user.id);
              console.log('Initial profile fetched:', profile);
              if (mounted) {
                setUser(profile);
              }
            } catch (profileError) {
              console.error('Error fetching initial profile:', profileError);
              if (mounted) {
                setUser(null);
              }
            }
          }
          
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !isInitialized) return;
      
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            console.log('Fetching user profile for:', session.user.id);
            const profile = await fetchUserProfile(session.user.id);
            console.log('Profile fetched:', profile);
            if (mounted) {
              setUser(profile);
            }
          } catch (error) {
            console.error('Error fetching profile on auth change:', error);
            if (mounted) {
              setUser(null);
            }
          }
        }, 0);
      } else {
        setUser(null);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    hasRole,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
