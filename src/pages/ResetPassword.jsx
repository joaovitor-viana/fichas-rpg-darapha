import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      alert('Erro ao redefinir: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-dark text-slate-100 font-body antialiased min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 bg-[#0a0a0a]"></div>
      <div className="fixed inset-0 spider-web-overlay pointer-events-none"></div>
      
      <div className="relative w-full max-w-md">
        <header className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center justify-center size-16 border-2 border-slate-500 rounded-full bg-black/50 shadow-lg">
            <span className="material-symbols-outlined text-slate-400 text-4xl">lock_reset</span>
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-[0.2em] text-slate-100 uppercase mb-2">Restaurar Alma</h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto"></div>
            <p className="font-serif-alt italic text-slate-500 mt-4 text-lg">Defina seu novo segredo</p>
          </div>
        </header>

        <div className="stone-texture p-8 md:p-10 relative group">
          <div className="absolute top-0 left-0 p-1 border-t-2 border-l-2 border-slate-600"></div>
          <div className="absolute top-0 right-0 p-1 border-t-2 border-r-2 border-slate-600"></div>
          <div className="absolute bottom-0 left-0 p-1 border-b-2 border-l-2 border-slate-600"></div>
          <div className="absolute bottom-0 right-0 p-1 border-b-2 border-r-2 border-slate-600"></div>

          {success ? (
            <div className="text-center space-y-6">
              <p className="text-slate-300 italic">O segredo foi restaurado com sucesso. Você será redirecionado para o portal em instantes...</p>
              <Link to="/login" className="block rust-hover w-full py-5 bg-stone border border-slate-700 text-slate-400 font-display text-lg tracking-[0.3em] uppercase">Ir para Login</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Novo Encantamento (Senha)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">lock</span>
                  <input 
                    className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                    placeholder="Nova senha" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Confirmar Encantamento</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">lock_clock</span>
                  <input 
                    className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                    placeholder="Repita a nova senha" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button 
                className="rust-hover w-full py-5 bg-stone border border-slate-700 text-slate-400 font-display text-lg tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Restaurando...' : 'Confirmar Novo Vínculo'}
                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
