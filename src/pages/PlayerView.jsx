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
  const navigate = useNavigate();
  const exportRef = useRef(null);

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
      alert('PROTOCOLADO COM SUCESSO.');
    } catch (error) {
      alert('ERRO NO PROTOCOLO: ' + error.message);
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

  const exportAsImage = async () => {
    if (!exportRef.current) return;
    try {
      setSaving(true);
      const dataUrl = await htmlToImage.toJpeg(exportRef.current, { 
        quality: 0.95, 
        backgroundColor: '#fff',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `PROTOCOLO-${player.nome || 'PERSONAGEM'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Erro na exportação: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    try {
      setSaving(true);
      const dataUrl = await htmlToImage.toPng(exportRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PROTOCOLO-${player.nome || 'PERSONAGEM'}.pdf`);
    } catch (err) {
      alert('Erro na exportação: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-spin text-black text-6xl mb-6">⚙️</div>
      <h2 className="font-sans font-black text-2xl text-black uppercase tracking-[0.3em]">PROCESSANDO PROTOCOLO...</h2>
    </div>
  );

  if (error || !player) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-black">
      <h2 className="font-sans font-black text-2xl uppercase tracking-widest">FALHA NO ACESSO</h2>
      <p className="mt-4 font-mono">DADOS CORROMPIDOS OU INEXISTENTES.</p>
      <Link to="/dashboard" className="mt-8 px-8 py-3 bg-black text-white font-bold uppercase tracking-widest">Retornar</Link>
    </div>
  );

  return (
    <div className="bg-[#e5e5e5] min-h-screen font-sans selection:bg-black selection:text-white">
      {/* Botões de Ação Superiores */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        <button onClick={saveChanges} className="w-12 h-12 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative">
          <span className="material-symbols-outlined text-2xl group-hover:hidden">save</span>
          <span className="hidden group-hover:block text-[8px] font-black">{saving ? '...' : 'SALVAR'}</span>
        </button>
        <button onClick={exportAsImage} className="w-12 h-12 bg-white text-black border-2 border-black rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative">
          <span className="material-symbols-outlined text-2xl group-hover:hidden">image</span>
          <span className="hidden group-hover:block text-[8px] font-black uppercase">JPG</span>
        </button>
        <button onClick={exportAsPDF} className="w-12 h-12 bg-white text-red-600 border-2 border-red-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative">
          <span className="material-symbols-outlined text-2xl group-hover:hidden">picture_as_pdf</span>
          <span className="hidden group-hover:block text-[8px] font-black uppercase">PDF</span>
        </button>
        <Link to="/dashboard" className="w-12 h-12 bg-white text-slate-500 border-2 border-slate-300 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-2xl">close</span>
        </Link>
      </div>

      <main className="flex justify-center py-10">
        <div 
          ref={exportRef}
          className="w-[850px] min-h-[1200px] bg-white p-16 shadow-2xl relative overflow-hidden border-[16px] border-black text-black"
          style={{ 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
            backgroundSize: '300px'
          }}
        >
          {/* Decorative Grunge Marks from Photo */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-black rotate-[-45deg] -translate-x-1/2 -translate-y-1/2 opacity-100"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-black rotate-[45deg] translate-x-1/2 -translate-y-1/2 opacity-100"></div>
          
          {/* Claw/Grunge marks on corners */}
          <div className="absolute top-10 left-10 w-24 h-24 rotate-[-15deg] opacity-20">
             <span className="material-symbols-outlined text-9xl">format_paint</span>
          </div>
          <div className="absolute bottom-20 right-10 w-24 h-24 rotate-[20deg] opacity-20">
             <span className="material-symbols-outlined text-9xl">format_paint</span>
          </div>

          <header className="text-center mb-16 relative z-10">
            <h1 className="text-[110px] font-black tracking-[0.2em] uppercase leading-none mb-12" style={{ fontFamily: 'Impact, sans-serif' }}>PROTOCOLO</h1>
            
            <div className="space-y-6 max-w-xl mx-auto uppercase font-black text-2xl">
              <div className="flex border-b-[3px] border-black pb-1 items-end gap-6 h-12">
                <span className="w-32 text-left text-sm opacity-60">PLAYER</span>
                <span className="flex-1 text-center font-bold">{user.email?.split('@')[0]}</span>
              </div>
              <div className="flex border-b-[3px] border-black pb-1 items-end gap-6 h-12">
                <span className="w-32 text-left text-sm opacity-60">PERSONAGEM</span>
                <input 
                  className="flex-1 text-center bg-transparent border-none focus:ring-0 text-3xl font-black uppercase p-0"
                  value={player.nome || ''}
                  onChange={(e) => handleUpdate('nome', e.target.value)}
                />
              </div>
              <div className="flex border-b-[3px] border-black pb-1 items-end gap-6 h-12">
                <span className="w-32 text-left text-sm opacity-60">IDADE</span>
                <input 
                  className="flex-1 text-center bg-transparent border-none focus:ring-0 text-3xl font-black uppercase p-0"
                  type="number"
                  value={player.idade || 0}
                  onChange={(e) => handleUpdate('idade', parseInt(e.target.value))}
                />
              </div>
              <div className="flex border-b-[3px] border-black pb-1 items-end gap-6 h-12">
                <span className="w-32 text-left text-sm opacity-60">SEXO</span>
                <input 
                  className="flex-1 text-center bg-transparent border-none focus:ring-0 text-3xl font-black uppercase p-0"
                  value={player.sexo || ''}
                  onChange={(e) => handleUpdate('sexo', e.target.value)}
                />
              </div>
            </div>
          </header>

          {/* Central Section: Circle + Gauges */}
          <div className="relative flex flex-col items-center mt-24 mb-32">
             
             {/* Convicção Arc at top (as in photo label) */}
             <div className="absolute top-[-80px] text-center w-full">
                <span className="text-2xl font-black uppercase tracking-[0.3em] block mb-4">CONVICÇÃO</span>
                <div className="w-[500px] h-6 border-4 border-black mx-auto overflow-hidden p-1">
                   <div className="h-full bg-black transition-all" style={{ width: `${Math.min(100, Math.max(0, player.conviccao_val || 50))}%` }}></div>
                   {/* We'll use conviccao_val or just vida for this bar if desired */}
                </div>
             </div>

             <div className="flex items-center gap-16 relative">
                 {/* FOME Gauge (Left) */}
                 <div className="flex flex-col items-center gap-6">
                    <span className="text-2xl font-black tracking-widest">FOME</span>
                    <div className="w-10 h-72 border-4 border-black group relative flex flex-col justify-end p-1 cursor-pointer" 
                         onClick={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           const y = rect.bottom - e.clientY;
                           handleUpdate('fome', Math.round((y / rect.height) * 100));
                         }}>
                       <div className="w-full bg-black transition-all" style={{ height: `${player.fome || 0}%` }}></div>
                       <div className="absolute inset-x-[-20px] top-[-30px] hidden group-hover:block bg-black text-white text-xs px-1 font-bold">{player.fome}%</div>
                    </div>
                 </div>

                 {/* Central PORTRAIT Ring */}
                 <div className="relative">
                    {/* Background Handprints */}
                    <div className="absolute top-[-100px] left-[-100px] opacity-10 grayscale pointer-events-none">
                       <span className="material-symbols-outlined text-[350px]">back_hand</span>
                    </div>

                    <div className="size-[420px] rounded-full border-[12px] border-black p-4 relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] group">
                       <input type="file" id="token-protocol" className="hidden" onChange={handleFileUpload} />
                       <label htmlFor="token-protocol" className="cursor-pointer block size-full rounded-full overflow-hidden border-4 border-black/5">
                          <div 
                            className="size-full bg-cover bg-center grayscale contrast-125 brightness-110 transition-transform group-hover:scale-105"
                            style={{ backgroundImage: `url('${player.token || ''}')` }}
                          ></div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="text-white font-black text-xl">ALTERAR TOKEN</span>
                          </div>
                       </label>
                       {/* TOKEN Label at bottom center of circle */}
                       <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 bg-white px-10 py-2 border-4 border-black text-2xl font-black tracking-[0.4em] z-20">TOKEN</div>
                    </div>
                 </div>

                 {/* SEDE Gauge (Right) */}
                 <div className="flex flex-col items-center gap-6">
                    <span className="text-2xl font-black tracking-widest">SEDE</span>
                    <div className="w-10 h-72 border-4 border-black group relative flex flex-col justify-end p-1 cursor-pointer"
                         onClick={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           const y = rect.bottom - e.clientY;
                           handleUpdate('sede', Math.round((y / rect.height) * 100));
                         }}>
                       <div className="w-full bg-black transition-all" style={{ height: `${player.sede || 0}%` }}></div>
                       <div className="absolute inset-x-[-20px] top-[-30px] hidden group-hover:block bg-black text-white text-xs px-1 font-bold">{player.sede}%</div>
                    </div>
                 </div>
             </div>

             {/* CARACTERÍSTICAS (Section curved below center) */}
             <div className="mt-20 w-full max-w-2xl text-center relative">
                <span className="text-xl font-black uppercase tracking-[0.4em] mb-4 block">CARACTERÍSTICAS</span>
                <textarea 
                  className="w-full bg-transparent border-4 border-black p-6 text-xl font-bold uppercase text-center focus:ring-0 min-h-[140px] resize-none overflow-hidden placeholder:opacity-10"
                  value={player.caracteristicas || ''}
                  onChange={(e) => handleUpdate('caracteristicas', e.target.value)}
                  placeholder="REGISTRE AS CARACTERÍSTICAS AQUI..."
                />
             </div>
          </div>

          {/* Bottom Grid: Remaining Fields */}
          <div className="grid grid-cols-2 gap-16 relative z-10 font-black uppercase">
             <div className="space-y-12">
                <div className="border-b-[4px] border-black pb-2">
                   <span className="text-[10px] opacity-40 block mb-2">ARMA PRINCIPAL</span>
                   <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-black" value={player.arma_principal || ''} onChange={(e) => handleUpdate('arma_principal', e.target.value)} />
                </div>
                <div className="border-b-[4px] border-black pb-2">
                   <span className="text-[10px] opacity-40 block mb-2">VEÍCULO</span>
                   <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-black" value={player.veiculo || ''} onChange={(e) => handleUpdate('veiculo', e.target.value)} />
                </div>
                <div className="border-b-[4px] border-black pb-2 h-[150px]">
                   <span className="text-[10px] opacity-40 block mb-2">INVENTÁRIO</span>
                   <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-bold min-h-[100px] resize-none" value={player.inventario?.join('\n') || ''} onChange={(e) => handleUpdate('inventario', e.target.value.split('\n'))} />
                </div>
             </div>

             <div className="space-y-12">
                <div className="border-b-[4px] border-black pb-2">
                   <span className="text-[10px] opacity-40 block mb-2">VIDA (ESTADO VITAL)</span>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        className="flex-1 accent-black"
                        value={player.vida || 0}
                        onChange={(e) => handleUpdate('vida', parseInt(e.target.value))}
                      />
                      <span className="text-xl">{player.vida}%</span>
                   </div>
                </div>
                <div className="border-b-[4px] border-black pb-2 h-[100px]">
                   <span className="text-[10px] opacity-40 block mb-2">CONDIÇÕES</span>
                   <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-bold min-h-[60px] resize-none" value={player.condicoes?.join('\n') || ''} onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))} placeholder="LISTE AS CONDIÇÕES..." />
                </div>
                <div className="border-b-[4px] border-black pb-2 h-[100px]">
                   <span className="text-[10px] opacity-40 block mb-2 text-red-700">TORMENTOS</span>
                   <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-red-900 min-h-[60px] resize-none" value={player.tormentos?.join('\n') || ''} onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))} placeholder="DESCREVA OS TRAUMAS..." />
                </div>
             </div>
          </div>

          <footer className="mt-20 flex justify-between items-end opacity-20 border-t-2 border-black pt-8">
             <div className="font-mono text-[10px]">PROTOCOLO_ID: {player.id?.toUpperCase()}</div>
             <div className="flex gap-4">
                <span className="material-symbols-outlined text-4xl">target</span>
                <span className="material-symbols-outlined text-4xl">grid_view</span>
             </div>
          </footer>
          
          {/* Decorative Horizontal Lines from Photo */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1">
             {[...Array(20)].map((_, i) => (
                <div key={i} className="w-8 h-1 bg-black"></div>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerView;
