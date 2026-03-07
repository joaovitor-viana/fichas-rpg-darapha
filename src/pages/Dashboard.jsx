import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch characters
      const { data: chars, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id);
      
      if (charError) throw charError;
      setCharacters(chars || []);

      // Fetch campaigns (where I am GM)
      const { data: camps, error: campError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('gm_id', user.id);
      
      if (campError) throw campError;
      setCampaigns(camps || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCharacter = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert([{ 
          user_id: user.id, 
          nome: 'Nova Alma',
          vida: 100,
          fome: 0,
          sede: 0
        }])
        .select()
        .single();

      if (error) throw error;
      navigate(`/character/${data.id}`);
    } catch (error) {
      alert('Erro ao criar personagem: ' + error.message);
    }
  };

  const createCampaign = async () => {
    const name = prompt('Nome da Campanha:');
    if (!name) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ 
          gm_id: user.id, 
          nome: name,
          descricao: 'Uma nova jornada sombria...'
        }])
        .select()
        .single();

      if (error) throw error;
      fetchData(); // Refresh list
    } catch (error) {
      alert('Erro ao criar campanha: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="animate-pulse font-cinzel text-primary text-2xl tracking-[0.5em]">Lendo o Destino...</div>
    </div>
  );

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen font-display pb-20">
      <header className="border-b border-primary/20 px-6 py-6 lg:px-20 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-4xl">dashboard_customize</span>
            <h1 className="font-cinzel text-2xl font-bold tracking-widest text-slate-100">Portal das Sombras</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-6 py-2 border border-primary/30 text-primary hover:bg-primary/10 transition-all text-xs font-bold tracking-widest"
          >
            SAIR DO REINO
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16">
        {/* Personagens */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <h2 className="font-cinzel text-xl font-bold tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person_filled</span> MEUS PERSONAGENS
            </h2>
            <button 
              onClick={createCharacter}
              className="stone-button flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">add</span> Nova Alma
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 italic">"Nenhuma alma vinculada a este portal..."</p>
              </div>
            ) : (
              characters.map(char => (
                <Link 
                  key={char.id} 
                  to={`/character/${char.id}`}
                  className="group relative bg-black/40 border border-slate-800 p-6 rounded-lg hover:border-primary/50 transition-all hover:translate-y-[-4px]"
                >
                  <div className="flex items-center gap-5">
                    <div className="size-16 rounded-full border-2 border-slate-700 bg-cover bg-center" style={{ backgroundImage: `url('${char.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=200'}')` }}></div>
                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-slate-200 group-hover:text-primary transition-colors uppercase tracking-tight">{char.nome}</h3>
                      <p className="text-xs text-slate-500 italic mt-1">{char.sexo || 'Desconhecido'} • Idade {char.idade || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-1 flex-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${char.vida}%` }}></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Campanhas */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <h2 className="font-cinzel text-xl font-bold tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">fort</span> MINHAS CAMPANHAS
            </h2>
            <button 
              onClick={createCampaign}
              className="stone-button flex items-center gap-2 px-4 py-2 bg-stone/20 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">add</span> Novo Reino
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 italic">"Nenhum reino sob seu domínio..."</p>
              </div>
            ) : (
              campaigns.map(camp => (
                <div 
                  key={camp.id} 
                  className="bg-primary/5 border border-primary/20 p-6 rounded-lg relative overflow-hidden group hover:bg-primary/10 transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">castle</span>
                  </div>
                  <h3 className="font-cinzel text-xl font-bold text-primary mb-2 uppercase tracking-widest">{camp.nome}</h3>
                  <p className="text-sm text-slate-400 font-serif-alt italic line-clamp-2 mb-6">{camp.descricao}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/campaign/${camp.id}`)}
                      className="flex-1 py-2 bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold tracking-widest uppercase hover:bg-primary/30 transition-all"
                    >
                      GERENCIAR
                    </button>
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/join/${camp.id}`;
                        navigator.clipboard.writeText(link);
                        alert('Link de convocação copiado para o pergaminho!');
                      }}
                      className="p-2 border border-slate-700 text-slate-500 hover:text-slate-200 transition-all" title="Copiar Link de Convite"
                    >
                      <span className="material-symbols-outlined text-lg">link</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
