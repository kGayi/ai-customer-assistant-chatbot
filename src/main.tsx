import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

// Set up auth state change listener
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);