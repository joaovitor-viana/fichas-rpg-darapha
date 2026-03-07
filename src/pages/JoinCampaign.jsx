import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const JoinCampaign = () => {
  const { id: campaignId } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && campaignId) {
      fetchData();
    }
  }, [user, campaignId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Campaign Info
      const { data: camp, error: campError } = await supabase
        .from('campaigns')
        .select('*, users!gm_id(id)')
        .eq('id', campaignId)
        .single();
      
      if (campError) throw campError;
      setCampaign(camp);

      // 2. Fetch My Characters
      const { data: chars, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id);
      
      if (charError) throw charError;
      setCharacters(chars || []);

    } catch (error) {
      console.error('Erro ao carregar convite:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (characterId) => {
    setJoining(true);
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert([{
          campaign_id: campaignId,
          user_id: user.id,
          character_id: characterId
        }]);

      if (error) {
        if (error.code === '23505') {
          alert('Você já faz parte deste reino!');
        } else {
          throw error;
        }
      } else {
        alert('Vínculo estabelecido! Você entrou na campanha.');
      }
      navigate('/dashboard');
    } catch (error) {
      alert('Erro ao entrar: ' + error.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="animate-pulse font-cinzel text-primary text-2xl tracking-[0.5em]">Ouvindo o Chamado...</div>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined text-slate-700 text-6xl mb-4">history_edu</span>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Convocação Expirada</h2>
      <p className="text-slate-500 italic mt-4">Este convite se perdeu nas brumas do tempo.</p>
      <Link to="/dashboard" className="mt-8 text-primary hover:underline uppercase text-xs tracking-widest font-bold">Voltar ao Portal</Link>
    </div>
  );

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen font-display flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-30"></div>
      
      <div className="relative w-full max-w-2xl bg-black/60 border border-primary/20 p-8 md:p-12 rounded-xl backdrop-blur-sm shadow-2xl text-center">
        <header className="mb-10">
          <div className="size-20 border-2 border-primary/50 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/5">
            <span className="material-symbols-outlined text-primary text-4xl">mark_email_unread</span>
          </div>
          <h1 className="font-cinzel text-3xl font-bold tracking-widest text-slate-100 uppercase mb-2">Convocação Real</h1>
          <p className="text-slate-400 italic font-serif-alt text-lg">Você foi convidado para o reino de</p>
          <h2 className="text-primary text-4xl font-black mt-4 uppercase tracking-tighter">{campaign.nome}</h2>
        </header>

        <section className="space-y-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <p className="text-slate-300">Escolha qual de suas almas atenderá a este chamado:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {characters.length === 0 ? (
              <div className="col-span-full py-8 border border-dashed border-slate-800 rounded-lg">
                <p className="text-slate-500 italic text-sm mb-4">Você ainda não possui almas neste plano.</p>
                <Link to="/dashboard" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Ir Criar Personagem</Link>
              </div>
            ) : (
              characters.map(char => (
                <button
                  key={char.id}
                  disabled={joining}
                  onClick={() => handleJoin(char.id)}
                  className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left group disabled:opacity-50"
                >
                  <div className="size-12 rounded-full border border-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${char.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=100'}')` }}></div>
                  <div className="min-w-0">
                    <h4 className="font-cinzel font-bold text-slate-200 group-hover:text-primary transition-colors truncate uppercase text-sm">{char.nome}</h4>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Vida: {char.vida}/100</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-8">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors">Recusar Chamado</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default JoinCampaign;
