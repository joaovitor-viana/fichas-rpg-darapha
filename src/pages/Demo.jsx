import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0a] text-slate-100 min-h-screen font-display relative overflow-hidden pb-20">
      <div className="fixed inset-0 spider-web-overlay pointer-events-none opacity-5"></div>
      
      {/* Header Demo */}
      <header className="border-b border-white/5 px-6 py-6 lg:px-20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="material-symbols-outlined text-slate-400 text-3xl hover:text-white transition-colors">arrow_back</Link>
            <h1 className="font-cinzel text-xl font-bold tracking-widest text-slate-100 uppercase">Demonstração: O Grimório</h1>
          </div>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-white text-black hover:bg-slate-200 transition-all text-xs font-black tracking-widest uppercase rounded shadow-lg"
          >
            Começar Agora
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-cinzel text-4xl font-black text-white uppercase tracking-tighter">A Estética do Pavor</h2>
          <p className="text-slate-500 italic font-serif-alt text-lg">"Uma interface forjada em pedra e sombras, projetada para a imersão total."</p>
        </div>

        {/* Mock Character Sheet Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Persona */}
          <div className="lg:col-span-4 space-y-8">
            <div className="stone-texture p-8 rounded-2xl flex flex-col items-center gap-6 border border-slate-900 shadow-2xl relative">
              <div className="size-48 rounded-full border-4 border-black bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] grayscale">
                <img src="https://images.unsplash.com/photo-1542641728-6ca359b085f4?auto=format&fit=crop&q=80&w=400" alt="Avatar Demo" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="text-center">
                <h3 className="font-cinzel text-3xl font-bold text-white uppercase tracking-tight">Malachi Thorne</h3>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Necromante • Sombrio</p>
              </div>
            </div>

            {/* Status Bars Mock */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-500">
                  <span>Vtalidade</span>
                  <span>85/100</span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-red-900 to-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-orange-400">
                  <span>Fome</span>
                  <span>42/100</span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-orange-900 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0e0e0e] border border-slate-900 p-8 rounded-xl space-y-4">
                <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">Habilidades</h4>
                <div className="space-y-3">
                  {['Toque do Abismo', 'Sussurros dos Mortos', 'Mortalha de Sombras'].map(skill => (
                    <div key={skill} className="flex items-center gap-3 text-sm text-slate-400 font-serif-alt italic">
                      <span className="material-symbols-outlined text-xs text-slate-700">pentagon</span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0e0e0e] border border-slate-900 p-8 rounded-xl space-y-4">
                <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2">Inventário</h4>
                <div className="space-y-3">
                  {['Adaga de Obsidiana', 'Anel de Sinete Antigo', 'Grimório de Couro Humano'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-slate-400 font-serif-alt italic">
                      <span className="material-symbols-outlined text-xs text-slate-700">inventory_2</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-slate-900 p-8 rounded-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                <span className="material-symbols-outlined text-[120px] text-white">menu_book</span>
              </div>
              <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">Relíquias & Tesouros</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-serif-alt italic">
                Um espaço dedicado para suas conquistas mais valiosas e artefatos de poder. O Grimório Sombrio permite anexar descrições ricas, propriedades mágicas e até segredos que apenas o Mestre pode revelar.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Final CTA */}
      <footer className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 border-t border-slate-900 mt-20">
        <h2 className="font-cinzel text-3xl font-bold text-white uppercase">Sua Própria Lenda Começa Aqui</h2>
        <p className="text-slate-500 uppercase text-xs tracking-[.4em]">GRATUITO • ILIMITADO • SOMBRIO</p>
        <button 
          onClick={() => navigate('/register')}
          className="bg-white hover:bg-slate-200 text-black px-12 py-5 text-lg font-black rounded uppercase tracking-widest shadow-2xl transition-all"
        >
          Criar Minha Ficha
        </button>
      </footer>
    </div>
  );
};

export default Demo;
