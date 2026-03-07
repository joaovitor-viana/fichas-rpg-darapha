import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
    } else {
      alert('Invocação enviada! Verifique seu pergaminho digital (email).');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0a0a0a] text-slate-100 font-display min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-5"></div>
      
      <div className="relative w-full max-w-md z-10">
        <header className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center justify-center size-16 border-2 border-slate-700 rounded-full bg-black shadow-xl">
             <span className="material-symbols-outlined text-slate-500 text-4xl">auto_fix_high</span>
          </div>
          <div className="text-center">
            <h1 className="font-cinzel text-4xl font-bold tracking-[0.2em] text-white uppercase mb-2">Novo Vínculo</h1>
            <div className="h-px w-32 bg-slate-800 mx-auto"></div>
            <p className="font-serif-alt italic text-slate-500 mt-4 text-lg">Inicie sua jornada nas sombras</p>
          </div>
        </header>

        <div className="bg-[#0e0e0e] border border-slate-900 p-10 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-1 border-t-2 border-l-2 border-slate-800"></div>
          <div className="absolute top-0 right-0 p-1 border-t-2 border-r-2 border-slate-800"></div>
          <div className="absolute bottom-0 left-0 p-1 border-b-2 border-l-2 border-slate-800"></div>
          <div className="absolute bottom-0 right-0 p-1 border-b-2 border-r-2 border-slate-800"></div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-xs tracking-widest text-slate-600 uppercase font-black">Identificador</label>
              <input 
                className="w-full bg-black border-slate-900 border-b focus:border-slate-400 focus:ring-0 text-slate-200 py-4 transition-all" 
                placeholder="Seu Email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs tracking-widest text-slate-600 uppercase font-black">Encantamento</label>
              <input 
                className="w-full bg-black border-slate-900 border-b focus:border-slate-400 focus:ring-0 text-slate-200 py-4 transition-all" 
                placeholder="Sua Senha" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              className="w-full py-5 bg-white/5 border border-slate-800 text-slate-400 font-bold text-lg tracking-[0.3em] uppercase hover:bg-white/10 hover:text-white transition-all disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Vincular Alma'}
            </button>
          </form>
          <div className="mt-10 text-center">
            <Link className="text-[10px] uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors" to="/login">Já possui um vínculo? Volte ao Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
