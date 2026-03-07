import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

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
    setSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update(player)
        .eq('id', id);

      if (error) throw error;
      alert('Selo rúnico aplicado com sucesso!');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-cinzel text-2xl animate-pulse">Invocando Ficha...</div>;
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="spider-web-overlay fixed inset-0 opacity-20"></div>
      <span className="material-symbols-outlined text-primary text-6xl mb-4">skull</span>
      <h2 className="font-cinzel text-2xl mb-2 text-slate-100 uppercase tracking-widest">Sussurro das Sombras</h2>
      <p className="text-slate-400 italic mb-6 max-w-md">"Uma barreira impede o Grimório de ler sua alma..."</p>
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg font-mono text-xs text-primary/80 mb-8 max-w-lg overflow-x-auto">
        Erro: {error}
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="rust-hover px-8 py-4 bg-stone border border-slate-700 text-slate-400 font-display text-xs tracking-widest uppercase"
      >
        Tentar Invocação Novamente
      </button>
    </div>
  );

  if (!player) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    </div>
  );

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-20">
      <header className="flex items-center justify-between border-b border-primary/20 px-6 py-4 lg:px-20 bg-background-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
          <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-slate-100">Grimório Sombrio</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold">
            SAIR
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-8">
        <div className="parchment-texture burnt-edge rounded-xl p-6 md:p-10 flex flex-col gap-8 shadow-2xl">
          <section className="flex flex-col md:flex-row gap-8 items-center border-b border-primary/10 pb-8">
            <div className="relative group cursor-pointer">
              <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="token-upload" className="cursor-pointer block relative">
                <div 
                  className="size-40 rounded-full border-4 border-slate-700 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-transform hover:scale-105"
                  style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                >
                  <div className="absolute inset-0 border-[12px] border-double border-slate-900/40 pointer-events-none rounded-full"></div>
                  <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-slate-900"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
                  </div>
                </div>
                <div className="absolute -inset-2 border-2 border-slate-600 rounded-full border-dashed opacity-50"></div>
              </label>
            </div>
            <div className="flex flex-col text-center md:text-left flex-1 min-w-0">
              <input 
                className="font-cinzel text-4xl font-black text-slate-100 tracking-tighter mb-1 bg-transparent border-none focus:ring-0 w-full text-center md:text-left placeholder:text-slate-700"
                value={player.nome || ''}
                onChange={(e) => handleUpdate('nome', e.target.value)}
                placeholder="NOME DO PERSONAGEM"
              />
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-medium italic">
                <div className="flex items-center gap-2">
                  <span>Idade:</span>
                  <input className="bg-transparent border-none focus:ring-0 p-0 w-12 text-slate-300" value={player.idade || ''} onChange={(e) => handleUpdate('idade', e.target.value)} />
                </div>
                <span className="text-primary/40">•</span>
                <div className="flex items-center gap-2">
                  <span>Sexo:</span>
                  <input className="bg-transparent border-none focus:ring-0 p-0 w-24 text-slate-300" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h3 className="font-cinzel text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">skull</span> ATRIBUTOS VITAIS
              </h3>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Vida', field: 'vida', color: 'bg-primary/80' },
                  { label: 'Fome', field: 'fome', color: 'bg-slate-600' },
                  { label: 'Sede', field: 'sede', color: 'bg-slate-500' }
                ].map((stat) => (
                  <div key={stat.field} className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="font-cinzel text-sm uppercase tracking-widest text-slate-300">{stat.label}</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none focus:ring-0 p-0 w-12 text-xs font-mono text-slate-400 text-right"
                        value={player[stat.field] || 0}
                        onChange={(e) => handleUpdate(stat.field, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="iron-frame h-5 rounded-sm p-0.5 overflow-hidden">
                      <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, player[stat.field] || 0))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="font-cinzel text-lg font-bold text-primary flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-sm">auto_stories</span> CONVICÇÃO
                </h3>
                <textarea 
                  className="w-full bg-primary/5 border border-primary/20 rounded-lg p-4 italic text-slate-300 leading-relaxed focus:ring-1 focus:ring-primary min-h-[100px]"
                  value={player.conviccao || ''}
                  onChange={(e) => handleUpdate('conviccao', e.target.value)}
                  placeholder="Seu lema ou propósito..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="font-cinzel text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">swords</span> ARMA PRINCIPAL
              </h3>
              <div className="iron-frame rounded-lg p-4 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-slate-500">architecture</span>
                <input 
                  className="font-cinzel font-bold text-slate-200 bg-transparent border-none focus:ring-0 text-center w-full"
                  value={player.arma_principal || ''}
                  onChange={(e) => handleUpdate('arma_principal', e.target.value)}
                  placeholder="Nome da Arma"
                />
              </div>

              <h3 className="font-cinzel text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span> TORMENTOS
              </h3>
              <div className="blood-texture rounded p-4 space-y-3">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-300 placeholder:text-slate-800 min-h-[100px]"
                  value={player.tormentos ? player.tormentos.join('\n') : ''}
                  onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))}
                  placeholder="Um tormento por linha..."
                />
              </div>
            </div>
          </section>

          <footer className="flex justify-end mt-4">
            <button 
              onClick={saveChanges}
              disabled={saving}
              className="wax-seal group relative flex items-center justify-center h-20 w-20 cursor-pointer border-none transition-transform active:scale-95 disabled:opacity-50"
            >
              <span className="font-cinzel font-black text-slate-900/80 text-xs tracking-tighter -rotate-12 group-hover:scale-110 transition-transform whitespace-pre text-center">
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
