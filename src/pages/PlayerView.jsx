import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const AutoExpandingTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none transition-[height] duration-200`}
    />
  );
};

const PlayerView = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tokenBase64, setTokenBase64] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const navigate = useNavigate();
  const sheetRef = useRef(null);
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);

  useEffect(() => {
    if (authUser && id) {
      fetchPlayerData();
    }
  }, [authUser, id]);

  useEffect(() => {
    if (player?.token) {
      fetch(player.token, { mode: 'cors' })
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => setTokenBase64(reader.result);
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.warn('Criação de Base64 para o token falhou:', err);
          setTokenBase64(player.token);
        });
    }
  }, [player?.token]);

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
    const { id: charId, user_id, updated_at, caracteristicas, ...updateData } = player;
    // Ensure caracteristicas is included if it exists in the player object
    const finalUpdateData = { ...updateData, caracteristicas: player.caracteristicas };
    setSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update(finalUpdateData)
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
      const fileName = `${authUser.id}-${Math.random()}.${fileExt}`;
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
      const exportWidth = 1200;
      
      const options = {
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        pixelRatio: 1.5,
        width: exportWidth,
        height: element.scrollHeight,
        cacheBust: true,
        style: {
          borderRadius: '0', 
          margin: '0',
          paddingBottom: '120px',
          minWidth: `${exportWidth}px`,
          width: `${exportWidth}px`
        }
      };

      if (type === 'jpg') {
        const dataUrl = await htmlToImage.toJpeg(element, options);
        if (!dataUrl) throw new Error('Falha na geração da imagem.');
        const link = document.createElement('a');
        link.download = `FICHA-${player.nome || 'personagem'}.jpg`;
        link.href = dataUrl;
        link.click();
      } else if (type === 'pdf') {
        const dataUrl = await htmlToImage.toPng(element, options);
        if (!dataUrl) throw new Error('Falha na geração do PDF.');
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => img.onload = r);
        const pdfWidth = 210;
        const pdfHeight = (img.height * pdfWidth) / img.width;
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`FICHA-${player.nome || 'personagem'}.pdf`);
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
      alert(`⚠️ Erro na Exportação: ${err?.message || 'Falha de Memória'}.`);
    } finally {
      setExporting(false);
    }
  };

  const addFeature = () => {
    if(!newFeature.trim()) return;
    const currentFeatures = player.caracteristicas ? player.caracteristicas.split('\n').filter(Boolean) : [];
    handleUpdate('caracteristicas', [...currentFeatures, newFeature.trim()].join('\n'));
    setNewFeature('');
  };

  const removeFeature = (index) => {
    const currentFeatures = player.caracteristicas ? player.caracteristicas.split('\n').filter(Boolean) : [];
    currentFeatures.splice(index, 1);
    handleUpdate('caracteristicas', currentFeatures.join('\n'));
  };

  const featuresList = player?.caracteristicas ? player.caracteristicas.split('\n').filter(Boolean) : [];
  
  // Safe parsing for numeric values
  const getNum = (val) => isNaN(parseInt(val)) ? 0 : parseInt(val);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-spin text-slate-500 text-6xl mb-6">⏳</div>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Invocando Ficha...</h2>
    </div>
  );

  if (error || !player) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <span className="material-symbols-outlined text-slate-500 text-6xl mb-4">skull</span>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Erro na Invocação</h2>
      <p className="text-slate-600 italic mt-4 max-w-md">"A alma não pôde ser lida pelo Grimório..."</p>
      <div className="flex gap-4 mt-8">
        <button onClick={fetchPlayerData} className="px-6 py-2 border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">Tentar Novamente</button>
        <Link to="/dashboard" className="px-6 py-2 border border-slate-800 text-slate-600 hover:text-slate-400 transition-all text-xs font-bold uppercase tracking-widest">Voltar</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] font-display text-slate-300 min-h-screen pb-20 relative overflow-hidden">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-5"></div>
      
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-slate-500 text-3xl">menu_book</Link>
          <div className="flex flex-col">
            <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-white">Grimório Sombrio</h1>
            <span className="text-[8px] tracking-[0.4em] text-slate-600 font-black uppercase">Ficha Monocromática</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shadow-inner">
             <button 
              onClick={() => handleExport('jpg')} 
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
             >
               <span className="material-symbols-outlined text-sm">image</span> {exporting ? '...' : 'JPG'}
             </button>
             <div className="w-px h-6 bg-white/10 my-auto"></div>
             <button 
              onClick={() => handleExport('pdf')} 
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
             >
               <span className="material-symbols-outlined text-sm">picture_as_pdf</span> {exporting ? '...' : 'PDF'}
             </button>
          </div>

          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-white/5 transition-all border border-white/5">
            <span className="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-6 bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12 relative z-10">
        <div 
          ref={sheetRef}
          className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-8 md:p-16 flex flex-col gap-12 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        >
          
          {/* IDENTIDADE */}
          <section className="flex flex-col text-center lg:text-left min-w-0 w-full space-y-8 border-b border-white/5 pb-10">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.6em] text-slate-500 font-black uppercase ml-1 opacity-60">Codinome</span>
              <input 
                className="font-cinzel text-6xl md:text-7xl font-black text-white tracking-tighter bg-transparent border-none focus:ring-0 w-full text-center lg:text-left placeholder:text-slate-900 uppercase"
                value={player.nome || ''}
                onChange={(e) => handleUpdate('nome', e.target.value)}
                placeholder="NOME"
              />
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-12">
               <div className="flex flex-col items-center lg:items-start group">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-bold mb-1 group-hover:text-white transition-colors">Idade</span>
                 <input className="bg-transparent border-b border-white/5 focus:border-white/20 focus:ring-0 p-1 text-white font-cinzel text-3xl w-24 text-center lg:text-left" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
               </div>
               <div className="flex flex-col items-center lg:items-start group">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-bold mb-1 group-hover:text-white transition-colors">Sexo</span>
                 <input className="bg-transparent border-b border-white/5 focus:border-white/20 focus:ring-0 p-1 text-white font-cinzel text-3xl min-w-[320px] text-center lg:text-left uppercase" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} placeholder="MASC / FEM / NB" />
               </div>
            </div>
          </section>

          {/* GRID EM 2 COLUNAS REBALANCEADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* COLUNA ESQUERDA: Características -> Token -> Tormentos */}
            <div className="flex flex-col gap-16 w-full">
              
              {/* Características */}
              <div className="space-y-6">
                <h3 className="font-cinzel text-xl font-bold text-slate-400 flex items-center gap-4 tracking-[0.3em] uppercase">
                  Características
                </h3>
                <div className="flex gap-2">
                  <input type="text"
                    className="flex-1 bg-black border border-white/5 p-4 rounded-xl text-white outline-none focus:border-white/20"
                    placeholder="Adicionar característica..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <button onClick={addFeature} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-slate-300">add</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {featuresList.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center group bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-slate-300 italic">{feature}</span>
                      <button onClick={() => removeFeature(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                  {featuresList.length === 0 && (
                    <div className="text-center py-8 text-slate-700 italic border border-dashed border-white/10 rounded-xl">
                      Nenhuma característica adicionada...
                    </div>
                  )}
                </div>
              </div>

              {/* Token */}
              <div className="flex justify-center">
                <div className="relative group shrink-0">
                   <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
                   <label htmlFor="token-upload" className="cursor-pointer block relative">
                      <div 
                        className="w-72 h-96 rounded-2xl border-2 border-white/10 bg-[#050505] overflow-hidden flex items-center justify-center relative transition-all duration-500 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                      >
                        {!player.token && (
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-6xl opacity-40 mb-4">portrait</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 bg-black/50 px-4 py-2 rounded-full border border-white/5">Token</span>
                          </div>
                        )}
                          {player.token && (
                              <img 
                                src={tokenBase64 || player.token} 
                                alt="Token" 
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous" 
                              />
                          )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 flex flex-col items-center justify-center text-white gap-2">
                           <span className="material-symbols-outlined text-4xl text-white">add_a_photo</span>
                           <span className="text-[10px] font-black uppercase tracking-widest mt-2">Trocar Token</span>
                        </div>
                      </div>
                   </label>
                </div>
              </div>

              {/* Tormentos */}
              <div className="space-y-6">
                <h3 className="font-cinzel text-xl font-bold text-slate-400 flex items-center gap-4 tracking-[0.3em] uppercase">
                  Tormentos
                </h3>
                <AutoExpandingTextarea 
                  className="w-full bg-black border border-white/5 p-8 rounded-3xl text-slate-400 italic text-sm leading-relaxed min-h-[120px] outline-none shadow-inner"
                  value={player.tormentos ? (Array.isArray(player.tormentos) ? player.tormentos.join('\n') : player.tormentos) : ''}
                  onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))}
                  placeholder="Quais cicatrizes não fecham?..." 
                />
              </div>
            </div>

            {/* COLUNA DIREITA: Convicção -> Vida/Fome/Sede -> Inventário -> Condições */}
            <div className="flex flex-col gap-14 w-full h-full">
              
              {/* Convicção */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-cinzel text-xl font-bold text-slate-400 tracking-[0.3em] uppercase">Convicção</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1.5 shadow-inner">
                      <button 
                        onClick={() => handleUpdate('conviccao', Math.max(0, getNum(player.conviccao) - 1))}
                        className="p-2 hover:bg-white/10 rounded-md transition-all text-slate-500 hover:text-white flex items-center justify-center"
                        title="Diminuir Convicção"
                      >
                        <span className="material-symbols-outlined text-base">arrow_downward</span>
                      </button>
                      <button 
                        onClick={() => handleUpdate('conviccao', Math.min(12, getNum(player.conviccao) + 1))}
                        className="p-2 hover:bg-white/10 rounded-md transition-all text-slate-500 hover:text-white border-l border-white/10 ml-1.5 pl-3 flex items-center justify-center"
                        title="Aumentar Convicção"
                      >
                        <span className="material-symbols-outlined text-base">arrow_upward</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold min-w-[32px] text-right">{getNum(player.conviccao)}/12</span>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2 bg-black/50 p-6 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  {[...Array(12)].map((_, i) => {
                    const isActive = getNum(player.conviccao) > i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleUpdate('conviccao', i + 1)}
                        className={`size-3 sm:size-4 flex-shrink-0 rounded-full border border-white/30 transition-all shadow-inner hover:scale-125
                          ${isActive ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] border-transparent' : 'bg-transparent'}
                        `}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Vida, Fome e Sede (Click-to-Toggle Selectors) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vida */}
                <div className="space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-slate-400 tracking-[0.2em] uppercase text-center md:text-left">Vida</h3>
                  <div className="relative">
                    <div 
                      onClick={() => setActiveStatusDropdown(activeStatusDropdown === 'vida' ? null : 'vida')}
                      className={`text-center px-4 py-3 rounded-xl border transition-all uppercase tracking-widest text-[11px] font-bold cursor-pointer
                      ${getNum(player.vida) === 0 ? 'bg-green-900/20 border-green-500/50 text-green-400' : 
                        'bg-red-900/30 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'}
                    `}>
                      {['Estável', 'Ferido', 'Debilitado', 'Morrendo'][getNum(player.vida)]}
                    </div>
                    {activeStatusDropdown === 'vida' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden flex flex-col z-20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {['Estável', 'Ferido', 'Debilitado', 'Morrendo'].map((estado, idx) => (
                          <button key={idx} onClick={() => { handleUpdate('vida', idx); setActiveStatusDropdown(null); }} className="px-4 py-3 text-[10px] uppercase font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left border-b border-white/5 last:border-none">
                            {estado}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fome */}
                <div className="space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-slate-400 tracking-[0.2em] uppercase text-center md:text-left">Fome</h3>
                  <div className="relative">
                    <div 
                      onClick={() => setActiveStatusDropdown(activeStatusDropdown === 'fome' ? null : 'fome')}
                      className={`text-center px-4 py-3 rounded-xl border transition-all uppercase tracking-widest text-[11px] font-bold cursor-pointer
                      ${getNum(player.fome) === 0 ? 'bg-green-900/20 border-green-500/50 text-green-400' : 
                        'bg-orange-900/30 border-orange-500 text-white shadow-[0_0_10px_rgba(234,88,12,0.3)]'}
                    `}>
                      {['Estável', 'Faminto', 'Debilitado', 'Inanição'][getNum(player.fome)]}
                    </div>
                    {activeStatusDropdown === 'fome' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden flex flex-col z-20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {['Estável', 'Faminto', 'Debilitado', 'Inanição'].map((estado, idx) => (
                          <button key={idx} onClick={() => { handleUpdate('fome', idx); setActiveStatusDropdown(null); }} className="px-4 py-3 text-[10px] uppercase font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left border-b border-white/5 last:border-none">
                            {estado}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sede */}
                <div className="space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-slate-400 tracking-[0.2em] uppercase text-center md:text-left">Sede</h3>
                  <div className="relative">
                    <div 
                      onClick={() => setActiveStatusDropdown(activeStatusDropdown === 'sede' ? null : 'sede')}
                      className={`text-center px-4 py-3 rounded-xl border transition-all uppercase tracking-widest text-[11px] font-bold cursor-pointer
                      ${getNum(player.sede) === 0 ? 'bg-green-900/20 border-green-500/50 text-green-400' : 
                        'bg-blue-900/30 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'}
                    `}>
                      {['Estável', 'Sedento', 'Desidratado', 'Colapso'][getNum(player.sede)]}
                    </div>
                    {activeStatusDropdown === 'sede' && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden flex flex-col z-20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {['Estável', 'Sedento', 'Desidratado', 'Colapso'].map((estado, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => { handleUpdate('sede', idx); setActiveStatusDropdown(null); }} 
                            className="w-full px-4 py-3 text-[10px] uppercase font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-center border-b border-white/5 last:border-none"
                          >
                            {estado}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventário */}
              <div className="space-y-6 w-full pt-4">
                <h3 className="font-cinzel text-xl font-bold text-slate-400 tracking-[0.3em] uppercase">Inventário</h3>
                <AutoExpandingTextarea 
                  className="w-full bg-black border border-white/5 p-8 rounded-3xl text-slate-400 min-h-[160px] outline-none font-mono text-xs leading-loose shadow-inner" 
                  value={player.inventario ? (Array.isArray(player.inventario) ? player.inventario.join('\n') : player.inventario) : ''} 
                  onChange={(e) => handleUpdate('inventario', e.target.value.split('\n'))} 
                  placeholder="Um item por linha..." 
                />
              </div>

              {/* Condições */}
              <div className="space-y-6 pt-4">
                <h3 className="font-cinzel text-xl font-bold text-slate-400 flex items-center gap-4 tracking-[0.3em] uppercase">Condições</h3>
                <AutoExpandingTextarea 
                  className="w-full bg-black border border-white/5 p-8 rounded-3xl text-slate-400 italic text-sm leading-relaxed placeholder:text-slate-800 min-h-[120px] outline-none shadow-inner"
                  value={player.condicoes ? (Array.isArray(player.condicoes) ? player.condicoes.join('\n') : player.condicoes) : ''}
                  onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))}
                  placeholder="Quais fardos carrega?..."
                />
              </div>
            </div>
          </div>

          {/* BOTÃO SELAR */}
          <footer className="flex justify-center pt-16 border-t border-white/5 mt-8">
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
