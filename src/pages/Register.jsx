import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (user) {
        // 2. Create entry in users table (as a Player by default)
        const { error: userError } = await supabase
          .from('users')
          .insert([{ id: user.id, is_gm: false }]);

        if (userError) throw userError;

        // 3. Create entry in players table
        const { error: playerError } = await supabase
          .from('players')
          .insert([{ 
            id: user.id, 
            nome: nome,
            vida: 100,
            fome: 0,
            sede: 0,
            sexo: 'Desconhecido',
            idade: '0'
          }]);

        if (playerError) throw playerError;

        alert('Sua alma foi vinculada ao grimório! Faça login agora.');
        navigate('/login');
      }
    } catch (error) {
      alert('Erro ao invocar alma: ' + error.message);
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
            <span className="material-symbols-outlined text-slate-400 text-4xl">person_add</span>
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-[0.2em] text-slate-100 uppercase mb-2">Invocar Alma</h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto"></div>
            <p className="font-serif-alt italic text-slate-500 mt-4 text-lg">Crie seu registro no grimório</p>
          </div>
        </header>

        <div className="stone-texture p-8 md:p-10 relative group">
          <div className="absolute top-0 left-0 p-1 border-t-2 border-l-2 border-slate-600"></div>
          <div className="absolute top-0 right-0 p-1 border-t-2 border-r-2 border-slate-600"></div>
          <div className="absolute bottom-0 left-0 p-1 border-b-2 border-l-2 border-slate-600"></div>
          <div className="absolute bottom-0 right-0 p-1 border-b-2 border-r-2 border-slate-600"></div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Nome do Personagem</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">edit</span>
                <input 
                  className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                  placeholder="Seu nome gótico" 
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Identificador (Email)</label>
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
              <label className="block font-display text-xs tracking-widest text-slate-400 uppercase">Encantamento (Senha)</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-slate-300 transition-colors">lock_open</span>
                <input 
                  className="w-full bg-black/40 border-slate-800 border-b-2 border-t-0 border-x-0 focus:ring-0 focus:border-slate-400 text-slate-200 font-body font-light pl-12 py-4 transition-all" 
                  placeholder="Mínimo 6 caracteres" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Invocando...' : 'Registrar'}
              <span className="material-symbols-outlined text-sm">double_arrow</span>
            </button>
          </form>
          
          <div className="mt-8 text-center text-[10px] font-display uppercase tracking-widest text-slate-600">
            <Link className="hover:text-slate-400 transition-colors" to="/login">Já possui um registro? Retorne</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
