import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-iron/50 bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            <h1 className="text-xl font-bold tracking-tight text-off-white uppercase">Grimório Sombrio</h1>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-medium text-muted-slate hover:text-primary transition-colors" href="#">Features</a>
            <a className="text-sm font-medium text-muted-slate hover:text-primary transition-colors" href="#">About</a>
            <a className="text-sm font-medium text-muted-slate hover:text-primary transition-colors" href="#">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 text-sm font-bold text-off-white hover:text-primary transition-colors border border-transparent">
              Login
            </button>
            <button className="bg-primary hover:bg-primary/90 text-off-white px-6 py-2 text-sm font-bold rounded shadow-lg shadow-primary/20 transition-all uppercase tracking-widest">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative hero-gradient min-h-[85vh] flex items-center justify-center px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 py-20">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold italic leading-tight text-off-white">
              The Ancient Grimoire Awaits Your Story
            </h2>
            <p className="text-lg md:text-xl text-muted-slate max-w-2xl mx-auto leading-relaxed">
              The ultimate RPG organizer and VTT platform for your darkest campaigns. Manage your world, characters, and combat in one gothic interface.
            </p>
            <div className="pt-6">
              <button className="bg-primary hover:bg-primary/90 text-off-white px-10 py-5 text-lg font-bold rounded-lg shadow-2xl shadow-primary/40 transition-all uppercase tracking-[0.2em] border border-primary/50 group">
                <span className="flex items-center gap-3">
                  Begin Your Journey
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
              <h3 className="text-primary font-bold tracking-[0.3em] uppercase text-sm">Forged in Darkness</h3>
              <h2 className="text-4xl font-bold text-off-white">Tools for the Master Storyteller</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'castle', title: 'Campaign Management', desc: 'Organize your world\'s timeline, hidden factions, and ancient secrets in a nested digital vault.' },
                { icon: 'person_book', title: 'Character Sheets', desc: 'Deep customization for your gothic heroes with dynamic stat tracking and inventory management.' },
                { icon: 'skull', title: 'Combat Tracker', desc: 'Seamless initiative tracking and status effects for brutal, tactical encounters in the shadows.' },
                { icon: 'ink_pen', title: 'Lore Compendium', desc: 'Build a comprehensive wiki of your world\'s dark history, deities, and forbidden knowledge.' }
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
            <h2 className="text-3xl md:text-4xl font-bold text-off-white">Ready to open the Grimoire?</h2>
            <p className="text-muted-slate">Join thousands of players weaving tales of dread and glory.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-off-white px-12 py-4 text-md font-bold rounded uppercase tracking-widest shadow-lg shadow-primary/20">
                Sign Up Now
              </button>
              <button className="w-full sm:w-auto border border-iron hover:bg-iron/20 text-off-white px-12 py-4 text-md font-bold rounded uppercase tracking-widest">
                View Demo
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
          <div className="flex gap-8">
            <a className="text-xs font-medium text-muted-slate hover:text-primary transition-colors uppercase tracking-widest" href="#">Terms of Service</a>
            <a className="text-xs font-medium text-muted-slate hover:text-primary transition-colors uppercase tracking-widest" href="#">Privacy Policy</a>
            <a className="text-xs font-medium text-muted-slate hover:text-primary transition-colors uppercase tracking-widest" href="#">Support</a>
          </div>
          <p className="text-xs text-iron uppercase tracking-widest">
            © 2024 Grimório Sombrio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
