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
import { DEV } from '@/lib/log';

function SupabaseTest() {
  useEffect(() => {
    if (!DEV) return;
    supabase.auth.getUser().then((result) => {
      console.log('[auth] getUser', result);
    });
  }, []);
  return null;
}

const App = () => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

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
    <>
      {DEV && <SupabaseTest />}
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
            path="/taskings/new" 
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
    </>
  );
};

export default App;
