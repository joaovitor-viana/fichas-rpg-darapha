import { useParams, useNavigate, Link } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';

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
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;
    try {
      setLoading(true);
      const dataUrl = await htmlToImage.toJpeg(exportRef.current, { quality: 0.95, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `ficha-${player.nome || 'personagem'}.jpg`;
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
      const dataUrl = await htmlToImage.toPng(exportRef.current);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ficha-${player.nome || 'personagem'}.pdf`);
    } catch (err) {
      alert('Erro ao exportar PDF: ' + err.message);
    } finally {
      setLoading(false);
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
        <div className="flex gap-2">
          <button onClick={exportAsImage} className="flex items-center justify-center rounded-lg h-10 px-3 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all text-xs font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">image</span> JPG
          </button>
          <button onClick={exportAsPDF} className="flex items-center justify-center rounded-lg h-10 px-3 bg-red-900/10 text-red-500 border border-red-900/20 hover:bg-red-900/20 transition-all text-xs font-bold uppercase tracking-widest gap-2">
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF
          </button>
          <div className="w-px h-10 bg-slate-800 mx-1"></div>
          <Link to="/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 group hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">home</span>
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-bold tracking-widest uppercase">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-12">
        <div className="parchment-texture burnt-edge rounded-xl p-8 md:p-12 flex flex-col gap-12 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {/* This div is for a decorative wax seal image/SVG, if desired */}
          </div>
          
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

      {/* TEMPLATE DE EXPORTAÇÃO "PROTOCOLO" (Oculto na tela) */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div 
          ref={exportRef}
          className="w-[800px] h-[1131px] bg-white text-black p-12 relative overflow-hidden font-serif"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}
        >
          {/* Handprints and Grunge (Mocked with SVGs/Images) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' }}></div>
          <div className="absolute top-10 left-10 size-40 opacity-10 rotate-[-15deg]">
            <span className="material-symbols-outlined text-9xl">back_hand</span>
          </div>
          <div className="absolute bottom-40 right-10 size-40 opacity-10 rotate-[20deg]">
            <span className="material-symbols-outlined text-9xl">back_hand</span>
          </div>

          {/* Decor: Chains at corners */}
          <div className="absolute top-0 left-0 p-4">
            <span className="material-symbols-outlined text-5xl opacity-20">link</span>
          </div>
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-5xl opacity-20 rotate-90">link</span>
          </div>

          {/* Title: PROTOCOLO */}
          <header className="text-center mb-12">
            <h1 className="text-7xl font-bold tracking-[0.5em] uppercase mb-8 border-b-4 border-black pb-4 inline-block">PROTOCOLO</h1>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex border-b border-black pb-1">
                <span className="text-xs uppercase font-bold w-32 text-left">PLAYER</span>
                <span className="flex-1 text-sm font-bold uppercase">{user.email?.split('@')[0]}</span>
              </div>
              <div className="flex border-b border-black pb-1">
                <span className="text-xs uppercase font-bold w-32 text-left">PERSONAGEM</span>
                <span className="flex-1 text-sm font-bold uppercase">{player.nome}</span>
              </div>
              <div className="flex border-b border-black pb-1">
                <span className="text-xs uppercase font-bold w-32 text-left">IDADE</span>
                <span className="flex-1 text-sm font-bold uppercase">{player.idade}</span>
              </div>
              <div className="flex border-b border-black pb-1">
                <span className="text-xs uppercase font-bold w-32 text-left">SEXO</span>
                <span className="flex-1 text-sm font-bold uppercase">{player.sexo}</span>
              </div>
            </div>
          </header>

          {/* Middle: Gauge Area */}
          <div className="relative h-[400px] flex items-center justify-center mb-12">
             {/* Convicção Arc at top */}
             <div className="absolute top-0 text-center">
                <span className="text-xs font-bold uppercase tracking-widest block mb-2">CONVICÇÃO</span>
                <div className="w-[300px] h-4 border-2 border-black rounded-full overflow-hidden p-0.5">
                   <div className="h-full bg-black" style={{ width: `${Math.min(100, (player.vida || 0))}%` }}></div>
                </div>
             </div>

             <div className="flex items-center gap-20">
                <div className="text-center">
                  <span className="text-xs font-bold uppercase block mb-4">FOME</span>
                  <div className="h-[200px] w-4 border-2 border-black rounded-full overflow-hidden p-0.5 flex flex-col justify-end">
                    <div className="w-full bg-black" style={{ height: `${player.fome}%` }}></div>
                  </div>
                </div>

                {/* Token Circle */}
                <div className="size-56 rounded-full border-[6px] border-black flex items-center justify-center p-2 relative">
                   <div className="absolute inset-[-12px] border-2 border-slate-300 border-dashed rounded-full animate-spin-slow"></div>
                   <div 
                    className="size-full rounded-full bg-cover bg-center grayscale contrast-125"
                    style={{ backgroundImage: `url('${player.token || 'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?auto=format&fit=crop&q=80&w=400'}')` }}
                   ></div>
                   <div className="absolute bottom-[-20px] bg-white px-4 border-2 border-black font-bold uppercase text-xs">TOKEN</div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold uppercase block mb-4">SEDE</span>
                  <div className="h-[200px] w-4 border-2 border-black rounded-full overflow-hidden p-0.5 flex flex-col justify-end">
                    <div className="w-full bg-black" style={{ height: `${player.sede}%` }}></div>
                  </div>
                </div>
             </div>
          </div>

          {/* Características Section */}
          <div className="border-2 border-black p-6 mb-8 relative">
            <h3 className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold uppercase tracking-[0.3em]">CARACTERÍSTICAS</h3>
            <p className="text-sm leading-relaxed text-justify h-[100px] overflow-hidden uppercase font-bold italic line-clamp-4">
              {player.caracteristicas || 'Sem registros nas sombras...'}
            </p>
          </div>

          {/* Bottom Grid: Items, Torments, etc */}
          <div className="grid grid-cols-2 gap-8 text-[10px] font-bold uppercase">
             <div className="space-y-4">
                <div className="border-b border-black py-1">
                  <span className="block mb-1 text-[8px] opacity-50">ARMA PRINCIPAL</span>
                  {player.arma_principal || '-'}
                </div>
                <div className="border-b border-black py-1">
                   <span className="block mb-1 text-[8px] opacity-50">VEÍCULO</span>
                   {player.veiculo || '-'}
                </div>
             </div>
             <div className="space-y-4">
                <div className="border-b border-black py-1">
                   <span className="block mb-1 text-[8px] opacity-50">CONDIÇÕES</span>
                   <div className="flex flex-wrap gap-2">
                    {player.condicoes?.map((c, i) => (
                      <span key={i} className="bg-black text-white px-1">{c}</span>
                    ))}
                   </div>
                </div>
                <div className="border-b border-black py-1">
                   <span className="block mb-1 text-[8px] opacity-50">TORMENTOS</span>
                   {player.tormentos?.slice(0, 3).join(' • ') || '-'}
                </div>
             </div>
          </div>

          <footer className="absolute bottom-12 left-12 right-12 flex justify-between items-end grayscale opacity-30">
             <div className="text-[8px] font-mono">ID: {player.id}</div>
             <span className="material-symbols-outlined text-4xl">target</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;
