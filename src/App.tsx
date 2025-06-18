import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import { useEffect, useState } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskingView from "./pages/TaskingView";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { supabase } from './lib/supabase';

const App = () => {
  const { user, loading, setUser, setLoading, setSession } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    let eventFired = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        eventFired = true;
        console.log('[AUTH EVENT]', event, session);
        setUser(session?.user ?? null);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }

        // ...profile creation logic...
      }
    );

    // Fallback: if no event after 1s, call getSession manually
    const fallbackTimeout = setTimeout(async () => {
      if (!eventFired) {
        console.warn('No auth event received, calling getSession() manually');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[FALLBACK getSession()]', session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If still no session, force reload or redirect
        if (!session) {
          window.location.reload();
          // or: window.location.href = '/login';
        }
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Add timeout protection
  useEffect(() => {
    // Reset timeout when loading state changes
    if (!loading) {
      setTimeoutReached(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Authentication timeout reached');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading spinner only during initial authentication
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If timeout reached and still loading, redirect to login
  if (timeoutReached) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/taskings/:taskingId" 
          element={
            <ProtectedRoute>
              <TaskingView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;
