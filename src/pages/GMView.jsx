import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';

const GMView = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Campaign
      const { data: camp, error: campError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (campError) throw campError;
      setCampaign(camp);

      // 2. Fetch Participants and their Characters
      const { data: parts, error: partError } = await supabase
        .from('campaign_participants')
        .select(`
          id,
          user_id,
          characters (
            id,
            nome,
            token,
            vida,
            fome,
            sede,
            sexo,
            idade
          )
        `)
        .eq('campaign_id', id);

      if (partError) throw partError;
      setParticipants(parts.filter(p => p.characters) || []);
    } catch (error) {
      console.error('Erro ao carregar campanha:', error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-20">
      <header className="flex items-center justify-between border-b border-primary/20 bg-background-dark/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-4xl hover:scale-110 transition-transform">castle</Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">{campaign?.nome || 'Grimório Sombrio'}</h1>
            <span className="text-[10px] text-slate-500 tracking-[0.3em] uppercase">Domínio do Mestre</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => supabase.auth.signOut()} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all">
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 py-12 text-center">
        <p className="text-slate-400 italic font-serif-alt text-lg">"{campaign?.descricao}"</p>
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={() => {
              const link = `${window.location.origin}/join/${id}`;
              navigator.clipboard.writeText(link);
              alert('Link de convocação copiado!');
            }}
            className="flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">group_add</span> Convocar Jogadores
          </button>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto w-full px-6 pb-20">
        <div className="flex border-b border-primary/10 mb-8 gap-10 overflow-x-auto no-scrollbar">
          <button className="border-b-2 border-primary text-primary pb-4 flex items-center gap-2 group">
            <span className="material-symbols-outlined text-sm">group</span>
            <span className="font-bold tracking-widest uppercase text-sm">Almas Vinculadas</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 italic">Consultando o oráculo...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {participants.map((part) => (
              <div key={part.id} className="relative group">
                <div className="absolute inset-0 bg-vellum border border-primary/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGWj4UkvgbP_qGzr2-Hg6t1or_UoBUvtZTtBJN5mMRUgkIS2HiD15TwWQMFu267eVLB8zxZ4xHl5Dtc_x-kqNZtCzWSLMS8AFoeasxSvyOvf0AommgGWL9AbDknlbHRSMyP9DrNgOf2LxJr4M1ivpfsD6AgtddlUTVsl0j5B7ecFP5Af8nfjBcnA87C5CPwfGFpFamKJUuAigtUVynU56xvYnyqMavi_hwiPpxe-dutO1fhc3rnR3pZ51WzZ33nYI28JZNIkw1uRA')" }}></div>
                </div>
                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full spider-web-border bg-cover bg-center overflow-hidden"
                        style={{ backgroundImage: `url('${part.characters.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=200'}')` }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold tracking-tight text-slate-100">{part.characters.nome}</h3>
                      <p className="text-xs uppercase tracking-widest text-primary font-bold">{part.characters.sexo} • {part.characters.idade} Anos</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs uppercase font-bold text-slate-400">Vitalidade</span>
                      <span className={`text-2xl font-bold italic ${part.characters.vida < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                        {part.characters.vida}/100
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link to={`/character/${part.characters.id}`} className="flex-1 bg-white text-black py-3 text-center text-xs font-black uppercase tracking-[0.2em] rounded border border-white hover:bg-slate-200 transition-all shadow-xl">
                      Abrir Ficha
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GMView;
