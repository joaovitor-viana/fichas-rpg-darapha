import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';

const PlayerView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && id) {
      fetchPlayerData();
    }
  }, [user, id]);

  const fetchPlayerData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlayer(data);
    } catch (err) {
      console.error('Error fetching character:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value) => {
    setPlayer(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!player) return;
    const { id: charId, user_id, updated_at, ...updateData } = player;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      alert('Registro selado com sucesso!');
    } catch (error) {
      alert('Erro ao selar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tokens')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tokens')
        .getPublicUrl(filePath);

      handleUpdate('token', publicUrl);
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-spin text-primary text-6xl mb-6">⏳</div>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Invocando Ficha...</h2>
    </div>
  );

  if (error || !player) return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <span className="material-symbols-outlined text-primary text-6xl mb-4">skull</span>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Erro na Invocação</h2>
      <p className="text-slate-500 italic mt-4 max-w-md">"A alma não pôde ser lida pelo Grimório..."</p>
      <div className="flex gap-4 mt-8">
        <button onClick={fetchPlayerData} className="px-6 py-2 border border-primary/40 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-widest">Tentar Novamente</button>
        <Link to="/dashboard" className="px-6 py-2 border border-slate-700 text-slate-500 hover:text-slate-200 transition-all text-xs font-bold uppercase tracking-widest">Voltar</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-background-dark font-display text-slate-200 min-h-screen pb-20 relative overflow-hidden">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-20"></div>
      
      {/* Header Fixo */}
      <header className="flex items-center justify-between border-b border-primary/20 px-6 py-4 lg:px-20 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-3xl">menu_book</Link>
          <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-slate-100">Grimório Sombrio</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12">
        <div className="parchment-texture-dark rounded-xl p-8 md:p-12 flex flex-col gap-12 shadow-2xl relative">
          
          {/* IDENTIDADE (Nome, Idade, Sexo, Token) */}
          <section className="flex flex-col lg:flex-row gap-12 items-center lg:items-end border-b border-slate-800 pb-12">
            <div className="relative group cursor-pointer shrink-0">
              <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="token-upload" className="cursor-pointer block relative">
                <div 
                  className="size-48 rounded-full border-4 border-slate-700 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-transform hover:scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                  style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                </div>
                <div className="absolute -inset-3 border-2 border-primary/20 rounded-full border-dashed opacity-50 pulse-slow"></div>
              </label>
            </div>
            <div className="flex flex-col text-center lg:text-left flex-1 min-w-0 w-full space-y-4">
              <input 
                className="font-cinzel text-5xl font-black text-slate-100 tracking-tighter bg-transparent border-none focus:ring-0 w-full text-center lg:text-left placeholder:text-slate-800 uppercase"
                value={player.nome || ''}
                onChange={(e) => handleUpdate('nome', e.target.value)}
                placeholder="NOME"
              />
              <div className="flex flex-wrap justify-center lg:justify-start gap-12">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">Idade</span>
                  <input className="bg-transparent border-b border-slate-800 focus:border-primary focus:ring-0 p-1 text-slate-100 font-cinzel text-xl w-20 text-center lg:text-left" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">Sexo</span>
                  <input className="bg-transparent border-b border-slate-800 focus:border-primary focus:ring-0 p-1 text-slate-100 font-cinzel text-xl w-32 text-center lg:text-left" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* STATUS (Vida, Fome, Sede, Condições) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h3 className="font-cinzel text-xl font-bold text-primary flex items-center gap-3 tracking-[0.3em]">
                <span className="material-symbols-outlined">vital_signs</span> STATUS
              </h3>
              <div className="space-y-8">
                {[
                  { label: 'Vida', field: 'vida', color: 'bg-primary' },
                  { label: 'Fome', field: 'fome', color: 'bg-orange-950' },
                  { label: 'Sede', field: 'sede', color: 'bg-blue-950' }
                ].map((stat) => (
                  <div key={stat.field} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none focus:ring-0 p-0 w-12 text-sm font-cinzel text-slate-200 text-right"
                        value={player[stat.field] || 0}
                        onChange={(e) => handleUpdate(stat.field, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-slate-800 p-[1px]">
                      <div className={`h-full ${stat.color} transition-all duration-700 relative`} style={{ width: `${Math.min(100, Math.max(0, player[stat.field] || 0))}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-inner"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-primary flex items-center gap-3 tracking-[0.3em]">
                <span className="material-symbols-outlined">emergency_home</span> CONDIÇÕES
              </h3>
              <div className="bg-black/30 border border-slate-800 p-6 rounded-lg min-h-[160px] flex">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-300 font-serif-alt italic leading-relaxed placeholder:text-slate-800 resize-none"
                  value={player.condicoes ? player.condicoes.join('\n') : ''}
                  onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))}
                  placeholder="Uma condição por linha..."
                />
              </div>
            </div>
          </section>

          {/* MENTE E ALMA (Convicção, Características) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-slate-800 pt-12">
            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-primary flex items-center gap-3 tracking-[0.3em]">
                <span className="material-symbols-outlined">auto_stories</span> CONVICÇÃO
              </h3>
              <textarea 
                className="w-full bg-black/30 border border-slate-800 rounded-lg p-6 text-slate-300 font-serif-alt italic leading-relaxed focus:ring-1 focus:ring-primary min-h-[140px] placeholder:text-slate-800 resize-none"
                value={player.conviccao || ''}
                onChange={(e) => handleUpdate('conviccao', e.target.value)}
                placeholder="Seu propósito..."
              />
            </div>
            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-primary flex items-center gap-3 tracking-[0.3em]">
                <span className="material-symbols-outlined">psychology</span> CARACTERÍSTICAS
              </h3>
              <textarea 
                className="w-full bg-black/30 border border-slate-800 rounded-lg p-6 text-slate-300 leading-relaxed focus:ring-1 focus:ring-primary min-h-[140px] placeholder:text-slate-800 resize-none"
                value={player.caracteristicas || ''}
                onChange={(e) => handleUpdate('caracteristicas', e.target.value)}
                placeholder="Traços de personalidade, aparência..."
              />
            </div>
          </section>

          {/* POSSES (Arma Principal, Veículo, Inventário) */}
          <section className="space-y-12 border-t border-slate-800 pt-12">
            <h3 className="font-cinzel text-xl font-bold text-primary flex items-center gap-3 tracking-[0.3em]">
              <span className="material-symbols-outlined">inventory_2</span> POSSES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Arma Principal</span>
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-slate-800 group focus-within:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-slate-600 group-focus-within:text-primary transition-colors">swords</span>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-slate-200 font-cinzel uppercase flex-1"
                      value={player.arma_principal || ''}
                      onChange={(e) => handleUpdate('arma_principal', e.target.value)}
                      placeholder="Arma"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Veículo</span>
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-lg border border-slate-800 group focus-within:border-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-slate-600 group-focus-within:text-primary transition-colors">directions_car</span>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-slate-200 font-cinzel uppercase flex-1"
                      value={player.veiculo || ''}
                      onChange={(e) => handleUpdate('veiculo', e.target.value)}
                      placeholder="Veículo"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Inventário</span>
                <div className="bg-black/30 border border-slate-800 p-6 rounded-lg flex-1 min-h-[160px] flex">
                  <textarea 
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 leading-relaxed placeholder:text-slate-800 resize-none"
                    value={player.inventario ? player.inventario.join('\n') : ''}
                    onChange={(e) => handleUpdate('inventario', e.target.value.split('\n'))}
                    placeholder="Um item por linha..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PERIGO (Tormentos) */}
          <section className="space-y-6 border-t border-slate-800 pt-12">
            <h3 className="font-cinzel text-xl font-bold text-red-900 flex items-center gap-3 tracking-[0.3em]">
              <span className="material-symbols-outlined text-red-700">warning</span> TORMENTOS
            </h3>
            <div className="bg-red-950/10 border border-red-900/30 p-8 rounded-lg flex">
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-red-200/60 font-serif-alt italic leading-relaxed min-h-[100px] placeholder:text-slate-900 resize-none"
                value={player.tormentos ? player.tormentos.join('\n') : ''}
                onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))}
                placeholder="Seus traumas..."
              />
            </div>
          </section>

          {/* SELO DE CERA (Salvar) */}
          <footer className="flex justify-center pt-8 border-t border-slate-800">
            <button 
              onClick={saveChanges}
              disabled={saving}
              className="wax-seal group relative flex items-center justify-center h-28 w-28 cursor-pointer border-none transition-transform active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <span className="font-cinzel font-black text-slate-900/90 text-sm tracking-tighter -rotate-12 group-hover:scale-110 transition-transform whitespace-pre text-center z-10">
                {saving ? '...' : 'SELAR'}
              </span>
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default PlayerView;
