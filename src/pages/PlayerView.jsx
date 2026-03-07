import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const PlayerView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const sheetRef = useRef(null);

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

  const handleUpdate = (field, value) => {
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

  const handleExport = async (type = 'jpg') => {
    if (!sheetRef.current || exporting) return;
    
    setExporting(true);
    try {
      const element = sheetRef.current;
      
      // Opções para garantir alta qualidade e visual fiel
      const options = {
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        cacheBust: true,
        style: {
          borderRadius: '0', // Remover bordas arredondadas na exportação se desejar 1:1
        }
      };

      if (type === 'jpg') {
        const dataUrl = await htmlToImage.toJpeg(element, options);
        const link = document.createElement('a');
        link.download = `FICHA-${player.nome || 'personagem'}.jpg`;
        link.href = dataUrl;
        link.click();
      } else if (type === 'pdf') {
        const dataUrl = await htmlToImage.toPng(element, { ...options, pixelRatio: 1.5 });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`FICHA-${player.nome || 'personagem'}.pdf`);
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
      alert('Erro ao gerar exportação: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-spin text-primary text-6xl mb-6">⏳</div>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Invocando Ficha...</h2>
    </div>
  );

  if (error || !player) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center text-slate-100">
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
    <div className="bg-[#0a0a0a] font-display text-slate-200 min-h-screen pb-20 relative overflow-hidden">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-10"></div>
      
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-3xl">menu_book</Link>
          <div className="flex flex-col">
            <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-white">Grimório Sombrio</h1>
            <span className="text-[8px] tracking-[0.4em] text-primary/60 font-black uppercase">Interface de Edição</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* HUD DE EXPORTAÇÃO INTEGRADO */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shadow-inner">
             <button 
              onClick={() => handleExport('jpg')} 
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
             >
               <span className="material-symbols-outlined text-sm">image</span> {exporting ? '...' : 'JPG'}
             </button>
             <div className="w-px h-6 bg-white/10 my-auto"></div>
             <button 
              onClick={() => handleExport('pdf')} 
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-red-500/80 hover:text-red-500"
             >
               <span className="material-symbols-outlined text-sm">picture_as_pdf</span> {exporting ? '...' : 'PDF'}
             </button>
          </div>

          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-white/5 transition-all border border-white/5">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12 relative z-10">
        <div 
          ref={sheetRef}
          className="bg-[#111111] border border-white/5 rounded-2xl p-8 md:p-16 flex flex-col gap-12 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        >
          
          {/* IDENTIDADE */}
          <section className="flex flex-col lg:flex-row gap-12 items-center lg:items-end border-b border-white/10 pb-16">
            <div className="relative group shrink-0">
               <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
               <label htmlFor="token-upload" className="cursor-pointer block relative">
                  <div 
                    className="size-56 rounded-full border-4 border-slate-900 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-all duration-500 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                    style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                       <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">Trocar Token</span>
                    </div>
                  </div>
               </label>
            </div>
            <div className="flex flex-col text-center lg:text-left flex-1 min-w-0 w-full space-y-6">
               <div className="space-y-1">
                 <span className="text-[10px] tracking-[0.6em] text-primary font-black uppercase ml-1 opacity-60">Codinome</span>
                 <input 
                  className="font-cinzel text-6xl md:text-7xl font-black text-white tracking-tighter bg-transparent border-none focus:ring-0 w-full text-center lg:text-left placeholder:text-slate-900 uppercase"
                  value={player.nome || ''}
                  onChange={(e) => handleUpdate('nome', e.target.value)}
                  placeholder="NOME"
                 />
               </div>
               <div className="flex flex-wrap justify-center lg:justify-start gap-12">
                  <div className="flex flex-col items-center lg:items-start group">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-1 group-hover:text-primary transition-colors">Idade</span>
                    <input className="bg-transparent border-b border-slate-900 focus:border-primary focus:ring-0 p-1 text-white font-cinzel text-3xl w-24 text-center lg:text-left" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
                  </div>
                  <div className="flex flex-col items-center lg:items-start group">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-1 group-hover:text-primary transition-colors">Sexo</span>
                    <input className="bg-transparent border-b border-slate-900 focus:border-primary focus:ring-0 p-1 text-white font-cinzel text-3xl w-40 text-center lg:text-left uppercase" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                  </div>
               </div>
            </div>
          </section>

          {/* STATUS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-[0.3em] uppercase">Status Vital</h3>
              <div className="space-y-10">
                {[
                  { label: 'Vida', field: 'vida', color: 'bg-red-900 border-red-800' },
                  { label: 'Fome', field: 'fome', color: 'bg-orange-900 border-orange-800' },
                  { label: 'Sede', field: 'sede', color: 'bg-blue-900 border-blue-800' }
                ].map((stat) => (
                  <div key={stat.field} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="font-cinzel text-[11px] uppercase tracking-[0.4em] text-slate-500 font-bold">{stat.label}</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none focus:ring-0 p-0 w-16 text-lg font-black text-white text-right"
                        value={player[stat.field] || 0}
                        onChange={(e) => handleUpdate(stat.field, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="h-4 bg-black rounded-full overflow-hidden p-[2px] border border-white/5 shadow-inner">
                      <div className={`h-full ${stat.color} border transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]`} style={{ width: `${Math.min(100, Math.max(0, player[stat.field] || 0))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-[0.3em] uppercase">Condições</h3>
              <div className="bg-black/40 border border-white/5 p-8 rounded-3xl min-h-[220px] flex shadow-inner group">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-400 italic text-xl leading-relaxed placeholder:text-slate-900 resize-none"
                  value={player.condicoes ? player.condicoes.join('\n') : ''}
                  onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))}
                  placeholder="Quais fardos carrega?..."
                />
              </div>
            </div>
          </section>

          {/* TRAÇOS E PSICOLOGIA */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 border-t border-white/10 pt-16">
            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-[0.3em] uppercase">Convicção</h3>
              <textarea 
                className="w-full bg-black/20 border border-white/5 rounded-2xl p-8 text-slate-300 italic text-lg leading-relaxed focus:ring-1 focus:ring-primary min-h-[180px] resize-none shadow-inner"
                value={player.conviccao || ''}
                onChange={(e) => handleUpdate('conviccao', e.target.value)}
                placeholder="Qual o seu juramento?..."
              />
            </div>
            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-[0.3em] uppercase">Características</h3>
              <textarea 
                className="w-full bg-black/20 border border-white/5 rounded-2xl p-8 text-slate-300 text-lg leading-relaxed focus:ring-1 focus:ring-primary min-h-[180px] resize-none shadow-inner"
                value={player.caracteristicas || ''}
                onChange={(e) => handleUpdate('caracteristicas', e.target.value)}
                placeholder="Aparência, vícios e virtudes..."
              />
            </div>
          </section>

          {/* ARSENAL E POSSES */}
          <section className="space-y-12 border-t border-white/10 pt-16">
            <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-[0.3em] uppercase">Posses e Logística</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="flex flex-col group">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black mb-3 ml-2 group-hover:opacity-100 opacity-60 transition-opacity">Arma de Combate</span>
                  <input className="bg-black/40 border border-white/5 p-6 rounded-2xl text-white font-cinzel text-xl uppercase focus:ring-1 focus:ring-primary outline-none shadow-inner" value={player.arma_principal || ''} onChange={(e) => handleUpdate('arma_principal', e.target.value)} />
                </div>
                <div className="flex flex-col group">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black mb-3 ml-2 group-hover:opacity-100 opacity-60 transition-opacity">Transporte</span>
                  <input className="bg-black/40 border border-white/5 p-6 rounded-2xl text-white font-cinzel text-xl uppercase focus:ring-1 focus:ring-primary outline-none shadow-inner" value={player.veiculo || ''} onChange={(e) => handleUpdate('veiculo', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col group">
                <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black mb-3 ml-2 group-hover:opacity-100 opacity-60 transition-opacity">Inventário Espiritual</span>
                <textarea className="bg-black/40 border border-white/5 p-8 rounded-3xl text-slate-400 min-h-[220px] resize-none focus:ring-1 focus:ring-primary outline-none font-mono text-sm leading-loose shadow-inner" value={player.inventario?.join('\n') || ''} onChange={(e) => handleUpdate('inventario', e.target.value.split('\n'))} placeholder="Um item por linha..." />
              </div>
            </div>
          </section>

          {/* TORMENTOS */}
          <section className="space-y-8 border-t border-white/10 pt-16">
            <h3 className="font-cinzel text-2xl font-bold text-red-900/80 flex items-center gap-4 tracking-[0.3em] uppercase">
              <span className="material-symbols-outlined">skull</span> Tormentos e Traumas
            </h3>
            <textarea className="w-full bg-red-950/5 border border-red-900/10 p-10 rounded-3xl text-red-100/40 italic text-xl min-h-[140px] resize-none outline-none focus:border-red-600/30 shadow-inner" value={player.tormentos?.join('\n') || ''} onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))} placeholder="Quais cicatrizes não fecham?..." />
          </section>

          {/* BOTÃO SELAR */}
          <footer className="flex justify-center pt-12 border-t border-white/10">
            <button 
              onClick={saveChanges} 
              disabled={saving} 
              className="relative active:scale-90 transition-transform disabled:opacity-50"
            >
              <div className="wax-seal h-32 w-32 flex items-center justify-center shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                <span className="font-cinzel font-black text-slate-900/90 text-sm tracking-tighter -rotate-12 select-none uppercase">
                  {saving ? '...' : 'SELAR'}
                </span>
              </div>
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default PlayerView;
