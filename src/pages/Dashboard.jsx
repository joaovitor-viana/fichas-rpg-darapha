import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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
      const { data: chars, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id);
      
      if (charError) throw charError;
      setCharacters(chars || []);

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
          fome: 100,
          sede: 100
        }])
        .select()
        .single();

      if (error) throw error;
      navigate(`/character/${data.id}`);
    } catch (error) {
      alert('Erro ao criar personagem: ' + error.message);
    }
  };

  const deleteCharacter = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja banir esta alma para o abismo? Esta ação é irreversível.')) return;

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCharacters(characters.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao excluir personagem: ' + error.message);
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
      fetchData(); 
    } catch (error) {
      alert('Erro ao criar campanha: ' + error.message);
    }
  };

  const editCampaign = async (id, currentName) => {
    const newName = prompt('Novo nome da Campanha:', currentName);
    if (!newName || newName === currentName) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ nome: newName })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Erro ao editar campanha: ' + error.message);
    }
  };

  const deleteCampaign = async (id) => {
    if (!confirm('Deseja realmente destruir este reino? Todas as crônicas serão perdidas.')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Erro ao excluir campanha: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="animate-pulse font-cinzel text-slate-400 text-2xl tracking-[0.5em]">Lendo o Destino...</div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] text-slate-100 min-h-screen font-display pb-20 relative overflow-hidden">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-5"></div>
      
      <header className="border-b border-white/5 px-6 py-6 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Protocolo" className="h-12 w-auto object-contain" />
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="px-6 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold tracking-widest uppercase"
          >
            Sair do Reino
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 relative z-10">
        {/* Personagens */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-4">
            <h2 className="font-cinzel text-xl font-bold tracking-widest flex items-center gap-3 text-slate-400">
              <span className="material-symbols-outlined">person_filled</span> MEUS PERSONAGENS
            </h2>
            <button 
              onClick={createCharacter}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">add</span> Nova Alma
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-900 rounded-xl">
                <p className="text-slate-700 italic font-medium">"Nenhuma alma vinculada a este portal..."</p>
              </div>
            ) : (
              characters.map(char => (
                <div key={char.id} className="relative group">
                  <Link 
                    to={`/character/${char.id}`}
                    className="block bg-[#0e0e0e] border border-slate-900 p-8 rounded-xl hover:border-slate-400 transition-all hover:translate-y-[-4px] shadow-lg"
                  >
                    <div className="flex items-center gap-6">
                      <div className="size-20 rounded-full border-2 border-slate-800 bg-cover bg-center shadow-inner" style={{ backgroundImage: `url('${char.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=200'}')` }}></div>
                      <div className="min-w-0">
                        <h3 className="font-cinzel text-xl font-bold text-slate-100 group-hover:text-white transition-colors uppercase tracking-tight truncate">{char.nome}</h3>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1">{char.sexo || 'Desconhecido'} • Idade {char.idade || 0}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4">
                       <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-slate-200" style={{ width: `${char.vida}%` }}></div>
                      </div>
                      <div className="py-2 bg-slate-100 text-black text-[9px] font-black text-center uppercase tracking-[0.2em] rounded border border-white group-hover:bg-white transition-all">
                        Abrir Ficha
                      </div>
                    </div>
                  </Link>
                  <button 
                    onClick={(e) => deleteCharacter(e, char.id)}
                    className="absolute top-4 right-4 p-2 text-slate-800 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir Personagem"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Campanhas */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-4">
            <h2 className="font-cinzel text-xl font-bold tracking-widest flex items-center gap-3 text-slate-400">
              <span className="material-symbols-outlined">fort</span> MINHAS CAMPANHAS
            </h2>
            <button 
              onClick={createCampaign}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">add</span> Novo Reino
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-900 rounded-xl">
                <p className="text-slate-700 italic font-medium">"Nenhum reino sob seu domínio..."</p>
              </div>
            ) : (
              campaigns.map(camp => (
                <div 
                  key={camp.id} 
                  className="bg-[#0e0e0e] border border-slate-900 p-8 rounded-xl relative overflow-hidden group hover:border-slate-500 transition-all"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <span className="material-symbols-outlined text-7xl text-white">castle</span>
                  </div>
                  <h3 className="font-cinzel text-2xl font-bold text-white mb-3 uppercase tracking-widest">{camp.nome}</h3>
                  <p className="text-sm text-slate-500 font-serif-alt italic line-clamp-2 mb-8 leading-relaxed">{camp.descricao}</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => navigate(`/campaign/${camp.id}`)}
                        className="flex-1 py-3 bg-slate-100 text-black text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white transition-all shadow-lg"
                      >
                        Gerenciar
                      </button>
                      <button 
                        onClick={() => {
                          const link = `${window.location.origin}/join/${camp.id}`;
                          navigator.clipboard.writeText(link);
                          alert('Link de convocação copiado para o pergaminho!');
                        }}
                        className="px-3 border border-slate-800 text-slate-600 hover:text-white hover:border-slate-400 transition-all" title="Copiar Link"
                      >
                        <span className="material-symbols-outlined text-xl">link</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button 
                        onClick={() => editCampaign(camp.id, camp.nome)}
                        className="py-2 border border-slate-900 text-slate-700 text-[9px] font-bold tracking-widest uppercase hover:text-slate-300 transition-all"
                      >
                        Editar Nome
                      </button>
                      <button 
                        onClick={() => deleteCampaign(camp.id)}
                        className="py-2 border border-slate-900 text-slate-800 text-[9px] font-bold tracking-widest uppercase hover:text-white transition-all"
                      >
                        Destruir
                      </button>
                    </div>
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
