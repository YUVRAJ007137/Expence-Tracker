import { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import MainApp from './components/MainApp';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
      } else if (session) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('checkAuth error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (newUser) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <MainApp user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
