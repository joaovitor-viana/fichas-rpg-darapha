import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const GMView = () => {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-20">
      <header className="flex items-center justify-between border-b border-primary/20 bg-background-dark/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl">skull</span>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Grimório Sombrio</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => supabase.auth.signOut()} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all">
            Abandonar Sessão
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 py-8">
        <div className="relative group">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-[#4a3730] rounded-l-full shadow-lg border-y border-l border-primary/30"></div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-[#4a3730] rounded-r-full shadow-lg border-y border-r border-primary/30"></div>
          <label className="flex flex-col w-full">
            <div className="flex w-full items-stretch scroll-input rounded-sm border-y border-primary/20 h-14 relative overflow-hidden">
              <div className="text-primary/60 flex items-center justify-center pl-6">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="w-full bg-transparent border-none text-slate-100 focus:ring-0 placeholder:text-slate-500 text-lg italic px-4" 
                placeholder="Busque pelas sombras pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </label>
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
            {filteredPlayers.map((player) => (
              <div key={player.id} className="relative group">
                <div className="absolute inset-0 bg-vellum border border-primary/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGWj4UkvgbP_qGzr2-Hg6t1or_UoBUvtZTtBJN5mMRUgkIS2HiD15TwWQMFu267eVLB8zxZ4xHl5Dtc_x-kqNZtCzWSLMS8AFoeasxSvyOvf0AommgGWL9AbDknlbHRSMyP9DrNgOf2LxJr4M1ivpfsD6AgtddlUTVsl0j5B7ecFP5Af8nfjBcnA87C5CPwfGFpFamKJUuAigtUVynU56xvYnyqMavi_hwiFpxe-dutO1fhc3rnR3pZ51WzZ33nYI28JZNIkw1uRA')" }}></div>
                </div>
                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full spider-web-border bg-cover bg-center overflow-hidden grayscale contrast-125"
                        style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=200'}')` }}
                      ></div>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-slate-100 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border border-primary/50">
                        <span className="material-symbols-outlined text-[14px]">bloodtype</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold tracking-tight text-slate-100">{player.nome}</h3>
                      <p className="text-xs uppercase tracking-widest text-primary font-bold">{player.sexo} • {player.idade} Inviernos</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs uppercase font-bold text-slate-400">Vitalidade</span>
                      <span className={`text-2xl font-bold italic ${player.vida < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                        {player.vida}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-background-dark/40 p-2 rounded border border-white/5">
                        <span className="material-symbols-outlined text-sm text-amber-600">restaurant</span>
                        <span className="text-sm font-medium">Fome: {player.fome}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-background-dark/40 p-2 rounded border border-white/5">
                        <span className="material-symbols-outlined text-sm text-cyan-600">water_drop</span>
                        <span className="text-sm font-medium">Sede: {player.sede}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <button className="flex-1 bg-primary text-slate-100 py-2 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-primary/80 transition-all border border-primary/50">
                      Abrir Ficha
                    </button>
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
