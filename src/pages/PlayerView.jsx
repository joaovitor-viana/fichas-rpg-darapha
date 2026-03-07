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
      alert('Token atualizado com sucesso!');
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;
    try {
      setSaving(true);
      // Forçar o template de exportação a ser visível momentaneamente para garantir a captura
      const template = exportRef.current;
      template.style.display = 'block';
      
      const dataUrl = await htmlToImage.toJpeg(template, { 
        quality: 0.95, 
        backgroundColor: '#fff',
        pixelRatio: 2,
        style: {
          display: 'block'
        }
      });
      
      template.style.display = 'none';

      const link = document.createElement('a');
      link.download = `ficha-${player.nome || 'personagem'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Erro ao exportar imagem: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    try {
      setSaving(true);
      const template = exportRef.current;
      template.style.display = 'block';

      const dataUrl = await htmlToImage.toPng(template, { 
        pixelRatio: 2,
        style: {
          display: 'block'
        }
      });

      template.style.display = 'none';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ficha-${player.nome || 'personagem'}.pdf`);
    } catch (err) {
      alert('Erro ao exportar PDF: ' + err.message);
    } finally {
      setSaving(false);
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
    <div className="bg-[#0f0f0f] font-sans text-slate-200 min-h-screen pb-20 relative overflow-hidden">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-3xl">shield</Link>
          <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-white">PROTOCOLO</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportAsImage} className="flex items-center justify-center rounded-lg h-10 px-3 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">image</span> JPG
          </button>
          <button onClick={exportAsPDF} className="flex items-center justify-center rounded-lg h-10 px-3 bg-red-900/10 text-red-500 border border-red-900/20 hover:bg-red-900/20 transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
          </button>
          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12">
        <div className="bg-[#151515] border border-white/10 rounded-xl p-8 md:p-16 flex flex-col gap-16 shadow-2xl relative">
          
          {/* Identidade */}
          <section className="flex flex-col lg:flex-row gap-12 items-center border-b border-white/5 pb-16">
            <div className="relative group shrink-0">
              <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="token-upload" className="cursor-pointer block">
                <div 
                  className="size-56 rounded-full border-4 border-white/10 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-transform hover:scale-105 shadow-2xl"
                  style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex-1 w-full space-y-8">
              <input 
                className="font-cinzel text-6xl font-black text-white tracking-tighter bg-transparent border-none focus:ring-0 w-full text-center lg:text-left uppercase p-0"
                value={player.nome || ''}
                onChange={(e) => handleUpdate('nome', e.target.value)}
                placeholder="NOME"
              />
              <div className="grid grid-cols-2 gap-12 max-w-sm mx-auto lg:mx-0">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Idade</span>
                  <input className="bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 w-full p-1 text-white font-cinzel text-3xl" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Sexo</span>
                  <input className="bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 w-full p-1 text-white font-cinzel text-3xl" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Atributos / Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-widest uppercase">Status</h3>
              <div className="space-y-10">
                {[
                  { label: 'Vida', field: 'vida', color: 'bg-red-600' },
                  { label: 'Fome', field: 'fome', color: 'bg-orange-600' },
                  { label: 'Sede', field: 'sede', color: 'bg-blue-600' }
                ].map((stat) => (
                  <div key={stat.field} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-slate-400">{stat.label}</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none focus:ring-0 p-0 w-12 text-sm font-bold text-white text-right"
                        value={player[stat.field] || 0}
                        onChange={(e) => handleUpdate(stat.field, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div className={`h-full ${stat.color} transition-all duration-700`} style={{ width: `${Math.min(100, (player[stat.field] || 0))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-4 tracking-widest uppercase">Condições</h3>
              <div className="bg-white/5 border border-white/5 p-8 rounded-xl h-[260px]">
                <textarea 
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 italic text-lg leading-relaxed placeholder:text-white/10 resize-none"
                  value={player.condicoes ? player.condicoes.join('\n') : ''}
                  onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))}
                  placeholder="Liste suas condições aqui..."
                />
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white tracking-widest uppercase">Convicção</h3>
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-xl p-8 text-slate-300 text-lg leading-relaxed focus:ring-1 focus:ring-primary h-[200px] resize-none"
                value={player.conviccao || ''}
                onChange={(e) => handleUpdate('conviccao', e.target.value)}
                placeholder="Qual o seu propósito?"
              />
            </div>
            <div className="space-y-8">
              <h3 className="font-cinzel text-2xl font-bold text-white tracking-widest uppercase">Características</h3>
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-xl p-8 text-slate-300 text-lg leading-relaxed focus:ring-1 focus:ring-primary h-[200px] resize-none"
                value={player.caracteristicas || ''}
                onChange={(e) => handleUpdate('caracteristicas', e.target.value)}
                placeholder="Personalidade e aparência..."
              />
            </div>
          </section>

          <footer className="flex justify-center pt-8 border-t border-white/5">
            <button 
              onClick={saveChanges}
              disabled={saving}
              className="wax-seal h-28 w-28 active:scale-95 transition-transform"
            >
              <span className="font-cinzel font-black text-slate-900/90 text-sm tracking-tighter -rotate-12">
                {saving ? '...' : 'SELAR'}
              </span>
            </button>
          </footer>
        </div>
      </main>

      {/* TEMPLATE DE EXPORTAÇÃO "PROTOCOLO" (REVERSÃO TOTAL À IMAGEM) */}
      <div 
        ref={exportRef}
        style={{ display: 'none', width: '1240px', minHeight: '1754px' }}
        className="bg-white text-black font-sans box-border"
      >
        <div className="p-16 relative min-h-[1754px] border-[20px] border-black">
          {/* Grunge Overlays Mockup */}
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}></div>
          
          {/* Top Decorative Marks */}
          <div className="absolute top-0 left-0 w-full flex justify-between px-10 pt-10">
             <div className="w-40 h-40 bg-black rotate-[-45deg] translate-x-[-50%] translate-y-[-50%]"></div>
             <div className="w-40 h-40 bg-black rotate-[45deg] translate-x-[50%] translate-y-[-50%]"></div>
          </div>

          <header className="text-center relative z-10">
            <h1 className="text-[120px] font-black tracking-[0.2em] uppercase leading-none mb-4" style={{ fontFamily: 'Impact, sans-serif' }}>PROTOCOLO</h1>
            
            <div className="mt-10 space-y-8 max-w-2xl mx-auto uppercase font-bold text-2xl">
              <div className="flex border-b-4 border-black pb-2 items-end">
                <span className="w-48 text-left text-xl">PLAYER</span>
                <span className="flex-1 text-center text-4xl">{user.email?.split('@')[0]}</span>
              </div>
              <div className="flex border-b-4 border-black pb-2 items-end">
                <span className="w-48 text-left text-xl">PERSONAGEM</span>
                <span className="flex-1 text-center text-4xl">{player.nome}</span>
              </div>
              <div className="flex border-b-4 border-black pb-2 items-end">
                <span className="w-48 text-left text-xl">IDADE</span>
                <span className="flex-1 text-center text-4xl">{player.idade}</span>
              </div>
              <div className="flex border-b-4 border-black pb-2 items-end">
                <span className="w-48 text-left text-xl">SEXO</span>
                <span className="flex-1 text-center text-4xl">{player.sexo}</span>
              </div>
            </div>
          </header>

          {/* Central Section */}
          <div className="mt-20 relative px-20">
            <div className="flex flex-col items-center">
               <span className="text-3xl font-black mb-4">CONVICÇÃO</span>
               <div className="w-[600px] h-10 border-4 border-black p-1">
                 <div className="h-full bg-black" style={{ width: '40%' }}></div>
               </div>
               
               <div className="flex items-center gap-24 mt-16 mt-[-40px]">
                 <div className="flex flex-col items-center gap-4">
                    <span className="text-3xl font-black">FOME</span>
                    <div className="w-10 h-64 border-4 border-black relative flex flex-col justify-end p-1">
                       <div className="w-full bg-black" style={{ height: `${player.fome}%` }}></div>
                    </div>
                 </div>

                 {/* Central Token Circle */}
                 <div className="relative">
                    {/* Handprints backgrounds (absolute) */}
                    <div className="absolute top-[-200px] left-[-200px] opacity-10">
                      <span className="material-symbols-outlined text-[300px]">back_hand</span>
                    </div>
                    <div className="absolute bottom-[-150px] right-[-200px] opacity-10 rotate-180">
                      <span className="material-symbols-outlined text-[300px]">back_hand</span>
                    </div>

                    <div className="size-[500px] rounded-full border-[10px] border-black p-4 relative bg-white">
                       <div 
                        className="size-full rounded-full bg-cover bg-center grayscale contrast-150 brightness-110"
                        style={{ backgroundImage: `url('${player.token || ''}')` }}
                       ></div>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-8 py-2 border-4 border-black text-3xl font-black">TOKEN</div>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-4">
                    <span className="text-3xl font-black">SEDE</span>
                    <div className="w-10 h-64 border-4 border-black relative flex flex-col justify-end p-1">
                       <div className="w-full bg-black" style={{ height: `${player.sede}%` }}></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Characteristics Area */}
          <div className="mt-32 border-4 border-black p-10 relative">
             <span className="absolute top-[-25px] left-10 bg-white px-4 text-3xl font-black">CARACTERÍSTICAS</span>
             <p className="text-3xl font-bold uppercase leading-relaxed text-justify h-[200px] overflow-hidden italic">
               {player.caracteristicas}
             </p>
          </div>

          {/* Bottom Grid Assets */}
          <div className="grid grid-cols-2 gap-20 mt-20 uppercase font-black">
             <div className="space-y-10">
                <div className="border-b-4 border-black pb-2 text-2xl">
                  <span className="text-sm block opacity-50">ARMA PRINCIPAL</span>
                  {player.arma_principal || '---'}
                </div>
                <div className="border-b-4 border-black pb-2 text-2xl">
                  <span className="text-sm block opacity-50">VEÍCULO</span>
                   {player.veiculo || '---'}
                </div>
             </div>
             <div className="space-y-10">
                <div className="border-b-4 border-black pb-2 text-2xl">
                   <span className="text-sm block opacity-50">CONDIÇÕES</span>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {player.condicoes?.map((c, i) => (
                       <span key={i} className="bg-black text-white px-3 py-1 text-lg">{c}</span>
                     ))}
                   </div>
                </div>
                <div className="border-b-4 border-black pb-2 text-2xl">
                   <span className="text-sm block opacity-50">TORMENTOS</span>
                   <span className="text-lg">{player.tormentos?.join(' • ')}</span>
                </div>
             </div>
          </div>

          {/* Bottom Chains Mockup (SVG lines) */}
          <div className="absolute bottom-10 left-0 w-full h-20 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, black 1px, transparent 1px)', backgroundSize: '10px 100%' }}></div>
          
          <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end">
             <div className="text-xl font-mono tracking-widest uppercase">SYS_PROTOCOLO_{player.id?.slice(0, 8)}</div>
             <div className="size-20 border-4 border-black rounded-full flex items-center justify-center">
                <div className="size-4 bg-black rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
