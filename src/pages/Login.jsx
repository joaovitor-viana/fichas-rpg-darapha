import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
    } else {
      // Check if user is GM or Player to redirect
      const { data: userProfile } = await supabase
        .from('users')
        .select('is_gm')
        .single();
      
      if (userProfile?.is_gm) {
        navigate('/gm');
      } else {
        navigate('/player');
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-background-dark text-slate-100 font-body antialiased min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 bg-[#0a0a0a]"></div>
      <div className="fixed inset-0 spider-web-overlay pointer-events-none"></div>
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] candle-glow pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        <header className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center justify-center size-16 border-2 border-slate-500 rounded-full bg-black/50 shadow-lg">
            <span className="material-symbols-outlined text-slate-400 text-4xl">skull</span>
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-[0.2em] text-slate-100 uppercase mb-2">Grimório Sombrio</h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto"></div>
            <p className="font-serif-alt italic text-slate-500 mt-4 text-lg">Enter the dark realm</p>
          </div>
        </header>

        <div className="stone-texture p-8 md:p-10 relative group">
          <div className="absolute top-0 left-0 p-1 border-t-2 border-l-2 border-slate-600"></div>
          <div className="absolute top-0 right-0 p-1 border-t-2 border-r-2 border-slate-600"></div>
          <div className="absolute bottom-0 left-0 p-1 border-b-2 border-l-2 border-slate-600"></div>
          <div className="absolute bottom-0 right-0 p-1 border-b-2 border-r-2 border-slate-600"></div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Your soul's identifier</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">alternate_email</span>
                <input 
                  className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                  placeholder="Email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">The secret incantation</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">lock_open</span>
                <input 
                  className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                  placeholder="Password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              className="rust-hover w-full py-5 bg-stone border border-slate-700 text-slate-400 font-display text-lg tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entering...' : 'Enter'}
              <span className="material-symbols-outlined text-sm">double_arrow</span>
            </button>
          </form>
          <div className="mt-8 flex justify-between items-center text-[10px] font-display uppercase tracking-widest text-slate-600">
            <a className="hover:text-slate-400 transition-colors" href="#">Lost your way?</a>
            <a className="hover:text-slate-400 transition-colors" href="#">Invoke new soul</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
