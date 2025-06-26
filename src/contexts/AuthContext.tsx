import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  forceSignOut: () => void
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Separate function to handle profile creation outside of auth state change
  const handleProfileCreation = async (user: User) => {
    try {
      console.log('[AUTH] Checking/creating profile for user:', user.id);
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        console.log('[AUTH] Creating new profile for user:', user.id);
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
        });
      }
    } catch (error) {
      console.error('Profile creation/check error:', error);
    }
  };

  useEffect(() => {
    let eventFired = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        eventFired = true;
        console.log('[AUTH EVENT]', event, session);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }

        // Handle profile creation outside of this handler to avoid deadlock
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to move this outside the auth state change handler
          setTimeout(() => {
            handleProfileCreation(session.user);
          }, 0);
        }
      }
    );

    // Fallback: if no event after 1s, call getSession manually
    const fallbackTimeout = setTimeout(async () => {
      if (!eventFired) {
        console.warn('No auth event received, calling getSession() manually');
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    console.log('[AUTH] Starting sign out process...');
    const { error } = await supabase.auth.signOut();
    console.log('[AUTH] Sign out completed:', error ? 'with error' : 'successfully');
    return { error };
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const forceSignOut = () => {
    console.log('[AUTH] Force sign out - clearing local state');
    setUser(null);
    setSession(null);
    setLoading(false);
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    forceSignOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 