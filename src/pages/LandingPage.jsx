import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-iron/50 bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            <h1 className="text-xl font-bold tracking-tight text-off-white uppercase">Grimório Sombrio</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-bold text-off-white hover:text-primary transition-colors border border-transparent"
            >
              Entrar
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-off-white px-6 py-2 text-sm font-bold rounded shadow-lg shadow-primary/20 transition-all uppercase tracking-widest"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative hero-gradient min-h-[85vh] flex items-center justify-center px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 py-20">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold italic leading-tight text-off-white">
              O Antigo Grimório Aguarda Sua História
            </h2>
            <p className="text-lg md:text-xl text-muted-slate max-w-2xl mx-auto leading-relaxed">
              O organizador definitivo de RPG e plataforma VTT para suas campanhas mais sombrias. Gerencie seu mundo, personagens e combates em uma interface gótica única.
            </p>
            <div className="pt-6">
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-primary/90 text-off-white px-10 py-5 text-lg font-bold rounded-lg shadow-2xl shadow-primary/40 transition-all uppercase tracking-[0.2em] border border-primary/50 group"
              >
                <span className="flex items-center gap-3">
                  Inicie Sua Jornada
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">swords</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 lg:px-20 bg-background-dark">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 space-y-4">
              <h3 className="text-primary font-bold tracking-[0.3em] uppercase text-sm">Forjado nas Sombras</h3>
              <h2 className="text-4xl font-bold text-off-white">Ferramentas para o Mestre Narrador</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'castle', title: 'Gestão de Campanhas', desc: 'Organize a linha do tempo do seu mundo, facções ocultas e segredos antigos em um cofre digital.' },
                { icon: 'person_book', title: 'Fichas de Personagem', desc: 'Customização profunda para seus heróis góticos com rastreamento dinâmico de status e inventário.' },
                { icon: 'skull', title: 'Rastreador de Combate', desc: 'Controle de iniciativa e efeitos de status integrados para encontros táticos brutais nas sombras.' },
                { icon: 'ink_pen', title: 'Compêndio de Lore', desc: 'Construa uma wiki abrangente da história sombria do seu mundo, divindades e conhecimentos proibidos.' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-vellum border border-iron p-8 rounded shadow-[0_10px_30px_rgba(0,0,0,0.5)] group hover:border-primary/50 transition-all">
                  <div className="mb-6 inline-flex items-center justify-center w-14 h-14 bg-iron/30 rounded text-primary">
                    <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-off-white">{feature.title}</h4>
                  <p className="text-muted-slate text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background-dark border-t border-iron/30">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-off-white">Pronto para abrir o Grimório?</h2>
            <p className="text-muted-slate">Junte-se a milhares de jogadores tecendo contos de pavor e glória.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-off-white px-12 py-4 text-md font-bold rounded uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Registrar Agora
              </button>
              <button className="w-full sm:w-auto border border-iron hover:bg-iron/20 text-off-white px-12 py-4 text-md font-bold rounded uppercase tracking-widest">
                Ver Demonstração
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-iron/20 py-12 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-60">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            <span className="text-sm font-bold text-off-white uppercase">Grimório Sombrio</span>
          </div>
          <p className="text-xs text-iron uppercase tracking-widest">
            © 2026 Grimório Sombrio. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
