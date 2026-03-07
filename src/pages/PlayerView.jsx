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
  const exportRef = useRef(null);

  // URL da imagem de fundo do Protocolo
  const PROTOCOLO_BG_URL = "https://krnydvgbctzsbeetznks.supabase.co/storage/v1/object/public/tokens/protocolo_template.png";

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

  const exportEngine = async (type = 'image') => {
    if (!exportRef.current || exporting) return;
    
    setExporting(true);
    const template = exportRef.current;
    const originalDisplay = template.style.display;
    
    try {
      // 1. Forçar visibilidade para captura
      template.style.display = 'block';
      template.style.visibility = 'visible';
      template.style.zIndex = '9999';
      
      // 2. Aguardar renderização e carregamento (Pode ser o culpado)
      await new Promise(r => setTimeout(r, 500));

      const options = { 
        quality: 0.95, 
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        includeQueryParams: true,
        // Ignorar erros de carregamento de imagens externas se necessário
        skipAttribute: 'data-skip-export'
      };

      let dataUrl;
      if (type === 'image') {
        dataUrl = await htmlToImage.toJpeg(template, options);
        const link = document.createElement('a');
        link.download = `PROTOCOLO-${player.nome || 'personagem'}.jpg`;
        link.href = dataUrl;
        link.click();
      } else {
        dataUrl = await htmlToImage.toPng(template, options);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`PROTOCOLO-${player.nome || 'personagem'}.pdf`);
      }

    } catch (err) {
      console.error('MOTOR DE EXPORTAÇÃO FALHOU:', err);
      
      // FALLBACK: Tentar sem o fundo se o erro for de imagem/cors
      try {
        console.warn('Tentando exportação de emergência (sem fundo)...');
        const fallbackOptions = { 
          quality: 0.7, 
          backgroundColor: '#ffffff',
          pixelRatio: 1,
          style: { backgroundImage: 'none', background: 'white' }
        };
        const fallbackUrl = await htmlToImage.toJpeg(template, fallbackOptions);
        const link = document.createElement('a');
        link.download = `EMERGENCIA-PROTOCOLO-${player.nome || 'personagem'}.jpg`;
        link.href = fallbackUrl;
        link.click();
        alert('Exportação concluída em modo de EMERGÊNCIA. A imagem de fundo falhou (CORS ou 404), mas os dados foram salvos.');
      } catch (fallbackErr) {
        alert('ERRO CRÍTICO NA EXPORTAÇÃO: ' + (err.message || 'Erro desconhecido.'));
      }
    } finally {
      template.style.display = originalDisplay;
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
    <div className="bg-[#050505] font-sans text-slate-200 min-h-screen pb-20 relative overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-20 bg-black/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-3xl">castle</Link>
          <div className="flex flex-col">
            <h1 className="font-cinzel text-xl font-bold tracking-[0.2em] uppercase text-white">GRIMÓRIO</h1>
            <span className="text-[8px] tracking-[0.5em] text-primary/60 font-black uppercase">Ficha de Personagem</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 shadow-inner">
             <button onClick={() => exportEngine('image')} disabled={exporting} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-slate-300 disabled:opacity-50">
               <span className="material-symbols-outlined text-sm">download</span> {exporting ? '...' : 'JPG'}
             </button>
             <div className="w-px h-6 bg-white/10 my-auto"></div>
             <button onClick={() => exportEngine('pdf')} disabled={exporting} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-red-500 disabled:opacity-50">
               <span className="material-symbols-outlined text-sm">picture_as_pdf</span> {exporting ? '...' : 'PDF'}
             </button>
          </div>
          <Link to="/dashboard" className="size-10 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 transition-all"><span className="material-symbols-outlined text-slate-400">home</span></Link>
          <button onClick={() => supabase.auth.signOut()} className="h-10 px-6 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all font-black text-[10px] uppercase tracking-widest">Sair</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12 relative z-10">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-8 md:p-16 flex flex-col gap-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative">
          
          <section className="flex flex-col lg:flex-row gap-12 items-center lg:items-end border-b border-white/5 pb-16">
            <div className="relative group shrink-0">
               <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
               <label htmlFor="token-upload" className="cursor-pointer block">
                  <div className="size-56 rounded-full border-2 border-white/10 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-all duration-500 group-hover:scale-[1.02] shadow-[0_0_80px_rgba(0,0,0,0.8)]" style={{ backgroundImage: `url('${player.token || ''}')` }}>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-4xl text-primary">photo_camera</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">Mudar Token</span>
                    </div>
                  </div>
               </label>
            </div>
            <div className="flex-1 w-full space-y-10">
               <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.5em] text-primary font-black uppercase ml-1">Codinome</span>
                  <input className="font-cinzel text-6xl md:text-7xl font-black text-white tracking-tighter bg-transparent border-none focus:ring-0 w-full p-0 placeholder:text-white/5 uppercase" value={player.nome || ''} onChange={(e) => handleUpdate('nome', e.target.value)} placeholder="NOME" />
               </div>
               <div className="grid grid-cols-2 gap-12 max-w-md">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Idade</span>
                    <input className="bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 w-full p-1 text-white font-cinzel text-3xl" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Sexo</span>
                    <input className="bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 w-full p-1 text-white font-cinzel text-3xl" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                  </div>
               </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             <div className="space-y-12">
                <h3 className="font-cinzel text-2xl font-bold text-white tracking-[0.2em] uppercase">Status Vital</h3>
                <div className="space-y-10">
                   {[{label:'Vida',field:'vida',color:'from-red-900 to-red-600'},{label:'Fome',field:'fome',color:'from-orange-900 to-orange-600'},{label:'Sede',field:'sede',color:'from-blue-900 to-blue-600'}].map(stat=>(
                     <div key={stat.field} className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-slate-500">{stat.label}</span>
                           <input type="number" className="bg-transparent border-none focus:ring-0 p-0 w-12 text-sm font-bold text-white text-right" value={player[stat.field]||0} onChange={e=>handleUpdate(stat.field,parseInt(e.target.value))}/>
                        </div>
                        <div className="h-3 bg-white/5 rounded-lg overflow-hidden p-[1px] border border-white/5 shadow-inner">
                           <div className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 rounded-md`} style={{width:`${Math.min(100,Math.max(0,player[stat.field]||0))}%`}}></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="space-y-8">
                <h3 className="font-cinzel text-2xl font-bold text-white tracking-[0.2em] uppercase">Condições</h3>
                <div className="bg-white/5 border border-white/5 p-8 rounded-3xl min-h-[280px] shadow-inner">
                   <textarea className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-400 italic text-lg leading-relaxed placeholder:text-slate-800 resize-none" value={player.condicoes?player.condicoes.join('\n'):''} onChange={e=>handleUpdate('condicoes',e.target.value.split('\n'))} placeholder="Liste os fardos..."/>
                </div>
             </div>
          </section>

          <footer className="flex justify-center pt-20 border-t border-white/5">
             <button onClick={saveChanges} disabled={saving} className="wax-seal h-28 w-28 active:scale-90 transition-transform"><span className="font-cinzel font-black text-slate-900/90 text-sm tracking-tighter -rotate-12 uppercase">{saving ? '...' : 'SELAR'}</span></button>
          </footer>
        </div>
      </main>

      {/* MOTOR DE EXPORTAÇÃO (Z-INDEX 0) */}
      <div 
        ref={exportRef}
        style={{ 
          display: 'none', 
          width: '840px', 
          height: '1188px',
          position: 'fixed',
          left: '-2000px',
          backgroundColor: 'white'
        }}
        className="text-black relative grayscale overflow-hidden box-border"
      >
        {/* Camada Fundo */}
        <img 
          src={PROTOCOLO_BG_URL} 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          alt="Template"
          crossOrigin="anonymous"
          onError={(e) => {
            console.warn('Fallback: Imagem de fundo falhou.');
            e.target.style.opacity = '0';
          }}
        />

        {/* Mapeamento Rigido */}
        <div className="relative z-10 w-full h-full font-sans">
           <div className="absolute top-[82px] left-[50%] -translate-x-1/2 w-[300px] text-center font-bold text-lg h-6 flex items-center justify-center uppercase">{user.email?.split('@')[0]}</div>
           <div className="absolute top-[138px] left-[50%] -translate-x-1/2 w-[400px] text-center font-black text-2xl h-10 flex items-center justify-center uppercase">{player.nome}</div>
           <div className="absolute top-[188px] left-[50%] -translate-x-1/2 w-[100px] text-center font-black text-2xl h-8 flex items-center justify-center uppercase">{player.idade}</div>
           <div className="absolute top-[238px] left-[50%] -translate-x-1/2 w-[250px] text-center font-black text-2xl h-8 flex items-center justify-center uppercase">{player.sexo}</div>
           <div className="absolute top-[405px] left-[50%] -translate-x-1/2 size-[310px] rounded-full overflow-hidden border-[4px] border-black flex items-center justify-center bg-white"><img src={player.token} className="w-full h-full object-cover grayscale contrast-125" crossOrigin="anonymous" /></div>
           <div className="absolute top-[425px] left-[98px] w-[26px] h-[218px] flex flex-col justify-end p-[1px]"><div className="w-full bg-black" style={{ height: `${player.fome}%` }}></div></div>
           <div className="absolute top-[425px] right-[98px] w-[26px] h-[218px] flex flex-col justify-end p-[1px]"><div className="w-full bg-black" style={{ height: `${player.sede}%` }}></div></div>
           <div className="absolute top-[775px] left-[51%] -translate-x-1/2 w-[480px] h-[100px] text-center font-bold text-sm uppercase italic leading-tight flex items-center justify-center"><div className="px-4">{player.caracteristicas}</div></div>
           <div className="absolute bottom-[104px] left-[90px] w-[240px] text-left font-black text-xs uppercase h-5 flex items-center">{player.arma_principal}</div>
           <div className="absolute bottom-[66px] left-[90px] w-[240px] text-left font-black text-xs uppercase h-5 flex items-center">{player.veiculo}</div>
           <div className="absolute bottom-[95px] right-[90px] w-[180px] text-right space-y-1"><div className="text-[7px] font-black opacity-60">CONDIÇÕES</div><div className="text-[9px] font-black truncate">{player.condicoes?.slice(0, 2).join(' • ')}</div></div>
           <div className="absolute bottom-[58px] right-[90px] w-[180px] text-right space-y-1"><div className="text-[7px] font-black opacity-60">TORMENTOS</div><div className="text-[9px] font-black truncate text-red-900">{player.tormentos?.slice(0, 2).join(' • ')}</div></div>
           <div className="absolute bottom-6 left-[50%] -translate-x-1/2 font-mono text-[7px] opacity-40 uppercase w-full text-center">SYS_ID_{player.id?.substring(0,8)} | STATUS_{player.vida}% | PROTOCOLO_FINAL</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
