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

  // URL da imagem de fundo do Protocolo (O usuário pode trocar se necessário)
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

  const exportAsImage = async () => {
    if (!exportRef.current) return;
    try {
      setLoading(true);
      const template = exportRef.current;
      template.style.display = 'block';
      const dataUrl = await htmlToImage.toJpeg(template, { quality: 0.95, backgroundColor: '#fff', pixelRatio: 2 });
      template.style.display = 'none';
      const link = document.createElement('a');
      link.download = `PROTOCOLO-${player.nome || 'personagem'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Erro ao exportar imagem: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    try {
      setLoading(true);
      const template = exportRef.current;
      template.style.display = 'block';
      const dataUrl = await htmlToImage.toPng(template, { pixelRatio: 2 });
      template.style.display = 'none';
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PROTOCOLO-${player.nome || 'personagem'}.pdf`);
    } catch (err) {
      alert('Erro ao exportar PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-spin text-primary text-6xl mb-6">⏳</div>
      <h2 className="font-cinzel text-2xl text-slate-400 uppercase tracking-widest">Invocando Ficha...</h2>
    </div>
  );

  if (error || !player) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-slate-100">
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
      
      {/* Header Fixo */}
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="material-symbols-outlined text-primary text-3xl">menu_book</Link>
          <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase text-white">Grimório Sombrio</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportAsImage} className="flex items-center justify-center rounded-lg h-10 px-3 bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">image</span> JPG
          </button>
          <button onClick={exportAsPDF} className="flex items-center justify-center rounded-lg h-10 px-3 bg-red-900/10 text-red-500 border border-red-900/20 hover:bg-red-900/20 transition-all text-[10px] font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
          </button>
          <div className="w-px h-10 bg-white/5 mx-2"></div>
          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12 relative z-10">
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col gap-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* IDENTIDADE */}
          <section className="flex flex-col lg:flex-row gap-12 items-center lg:items-end border-b border-white/5 pb-12">
            <div className="relative group shrink-0">
              <input type="file" id="token-upload" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="token-upload" className="cursor-pointer block relative">
                <div 
                  className="size-48 rounded-full border-4 border-slate-800 bg-cover bg-center overflow-hidden flex items-center justify-center relative transition-transform hover:scale-105 shadow-2xl"
                  style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex flex-col text-center lg:text-left flex-1 min-w-0 w-full space-y-4">
              <input 
                className="font-cinzel text-5xl font-black text-white tracking-tighter bg-transparent border-none focus:ring-0 w-full text-center lg:text-left placeholder:text-slate-800 uppercase"
                value={player.nome || ''}
                onChange={(e) => handleUpdate('nome', e.target.value)}
                placeholder="NOME"
              />
              <div className="flex flex-wrap justify-center lg:justify-start gap-12">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">Idade</span>
                  <input className="bg-transparent border-b border-slate-800 focus:border-primary focus:ring-0 p-1 text-white font-cinzel text-xl w-20 text-center lg:text-left" type="number" value={player.idade || 0} onChange={(e) => handleUpdate('idade', parseInt(e.target.value))} />
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">Sexo</span>
                  <input className="bg-transparent border-b border-slate-800 focus:border-primary focus:ring-0 p-1 text-white font-cinzel text-xl w-32 text-center lg:text-left" value={player.sexo || ''} onChange={(e) => handleUpdate('sexo', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* STATUS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-3 tracking-[0.3em] uppercase">Status</h3>
              <div className="space-y-8">
                {[
                  { label: 'Vida', field: 'vida', color: 'bg-red-700' },
                  { label: 'Fome', field: 'fome', color: 'bg-orange-700' },
                  { label: 'Sede', field: 'sede', color: 'bg-blue-700' }
                ].map((stat) => (
                  <div key={stat.field} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-slate-500">{stat.label}</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none focus:ring-0 p-0 w-12 text-sm font-bold text-slate-200 text-right"
                        value={player[stat.field] || 0}
                        onChange={(e) => handleUpdate(stat.field, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1.5px] border border-white/5">
                      <div className={`h-full ${stat.color} transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(0, player[stat.field] || 0))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-3 tracking-[0.3em] uppercase">Condições</h3>
              <div className="bg-white/5 border border-white/5 p-6 rounded-xl min-h-[160px] flex">
                <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-300 italic leading-relaxed placeholder:text-slate-800 resize-none"
                  value={player.condicoes ? player.condicoes.join('\n') : ''}
                  onChange={(e) => handleUpdate('condicoes', e.target.value.split('\n'))}
                  placeholder="Uma condição por linha..."
                />
              </div>
            </div>
          </section>

          {/* TRAÇOS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-white/5 pt-12">
            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-3 tracking-[0.3em] uppercase">Convicção</h3>
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-xl p-6 text-slate-300 italic leading-relaxed focus:ring-1 focus:ring-primary min-h-[140px] resize-none"
                value={player.conviccao || ''}
                onChange={(e) => handleUpdate('conviccao', e.target.value)}
              />
            </div>
            <div className="space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-3 tracking-[0.3em] uppercase">Características</h3>
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-xl p-6 text-slate-300 leading-relaxed focus:ring-1 focus:ring-primary min-h-[140px] resize-none"
                value={player.caracteristicas || ''}
                onChange={(e) => handleUpdate('caracteristicas', e.target.value)}
              />
            </div>
          </section>

          {/* POSSES */}
          <section className="space-y-12 border-t border-white/5 pt-12">
            <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-3 tracking-[0.3em] uppercase">Posses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Arma Principal</span>
                  <input className="bg-white/5 border border-white/5 p-4 rounded-xl text-white font-cinzel uppercase focus:ring-1 focus:ring-primary outline-none" value={player.arma_principal || ''} onChange={(e) => handleUpdate('arma_principal', e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Veículo</span>
                  <input className="bg-white/5 border border-white/5 p-4 rounded-xl text-white font-cinzel uppercase focus:ring-1 focus:ring-primary outline-none" value={player.veiculo || ''} onChange={(e) => handleUpdate('veiculo', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Inventário</span>
                <textarea className="bg-white/5 border border-white/5 p-6 rounded-xl text-slate-300 min-h-[160px] resize-none focus:ring-1 focus:ring-primary outline-none" value={player.inventario?.join('\n') || ''} onChange={(e) => handleUpdate('inventario', e.target.value.split('\n'))} />
              </div>
            </div>
          </section>

          {/* TRAUMAS */}
          <section className="space-y-6 border-t border-white/5 pt-12">
            <h3 className="font-cinzel text-xl font-bold text-red-900 flex items-center gap-3 tracking-[0.3em] uppercase">Tormentos</h3>
            <textarea className="w-full bg-red-950/10 border border-red-900/20 p-8 rounded-xl text-red-200/60 italic min-h-[100px] resize-none outline-none focus:border-red-600" value={player.tormentos?.join('\n') || ''} onChange={(e) => handleUpdate('tormentos', e.target.value.split('\n'))} />
          </section>

          {/* SALVAR */}
          <footer className="flex justify-center pt-8 border-t border-white/5">
            <button onClick={saveChanges} disabled={saving} className="wax-seal h-24 w-24 transition-transform active:scale-95 disabled:opacity-50">
              <span className="font-cinzel font-black text-slate-900/90 text-sm tracking-tighter -rotate-12">{saving ? '...' : 'SELAR'}</span>
            </button>
          </footer>
        </div>
      </main>

      {/* NOVO TEMPLATE DE EXPORTAÇÃO "PROTOCOLO" (OCULTO) */}
      <div 
        ref={exportRef}
        className="fixed left-[-9999px] top-[-9999px] w-[850px] h-[1200px] bg-white text-black relative grayscale overflow-hidden box-border"
        style={{ 
          backgroundImage: `url('${PROTOCOLO_BG_URL}')`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* PLAYER */}
        <div className="absolute top-[108px] left-[50%] -translate-x-1/2 w-[400px] text-center font-black text-2xl uppercase">
          {user.email?.split('@')[0]}
        </div>
        
        {/* PERSONAGEM */}
        <div className="absolute top-[170px] left-[50%] -translate-x-1/2 w-[400px] text-center font-black text-3xl uppercase">
          {player.nome}
        </div>

        {/* IDADE */}
        <div className="absolute top-[225px] left-[50%] -translate-x-1/2 w-[200px] text-center font-black text-3xl uppercase">
          {player.idade}
        </div>

        {/* SEXO */}
        <div className="absolute top-[275px] left-[50%] -translate-x-1/2 w-[300px] text-center font-black text-3xl uppercase">
          {player.sexo}
        </div>

        {/* CONVICÇÃO (Barra ou Texto) - Na foto é uma barra curva em cima do token */}
        {/* Como mapeamento é difícil sem coordenadas exatas, vou chutar baseado na imagem */}
        
        {/* TOKEN */}
        <div className="absolute top-[480px] left-[50%] -translate-x-1/2 size-[380px] rounded-full overflow-hidden grayscale contrast-125 border-4 border-black">
          <img src={player.token} className="w-full h-full object-cover" alt="" />
        </div>

        {/* FOME (Barra esquerda) */}
        <div className="absolute top-[470px] left-[130px] w-[35px] h-[260px] flex flex-col justify-end bg-black/10">
          <div className="w-full bg-black" style={{ height: `${player.fome}%` }}></div>
        </div>

        {/* SEDE (Barra direita) */}
        <div className="absolute top-[470px] right-[130px] w-[35px] h-[260px] flex flex-col justify-end bg-black/10">
          <div className="w-full bg-black" style={{ height: `${player.sede}%` }}></div>
        </div>

        {/* CARACTERÍSTICAS (Curvado em baixo ou caixa central) */}
        <div className="absolute top-[880px] left-[50%] -translate-x-1/2 w-[550px] text-center font-black text-lg uppercase leading-tight italic">
          {player.caracteristicas}
        </div>

        {/* ARMA PRINCIPAL (Base esquerda) */}
        <div className="absolute bottom-[115px] left-[100px] w-[250px] text-left font-black text-xl uppercase">
          {player.arma_principal}
        </div>

        {/* VEÍCULO (Abaixo da arma) */}
        <div className="absolute bottom-[65px] left-[100px] w-[250px] text-left font-black text-xl uppercase">
          {player.veiculo}
        </div>

        {/* CONDIÇÕES (Base direita topo) */}
        <div className="absolute bottom-[115px] right-[100px] w-[250px] text-right font-black text-[10px] uppercase flex flex-col gap-1">
          {player.condicoes?.slice(0, 3).map((c, i) => <span key={i}>{c}</span>)}
        </div>

        {/* TORMENTOS (Base direita baixo) */}
        <div className="absolute bottom-[65px] right-[100px] w-[250px] text-right font-black text-[10px] uppercase">
          {player.tormentos?.slice(0, 2).join(' • ')}
        </div>

        {/* VIDA (Não mapeado explicitamente na imagem original mas vou colocar como rodapé discreto) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono opacity-30 uppercase">
          STATUS_VITAL_{player.vida}% | ID_{player.id}
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
