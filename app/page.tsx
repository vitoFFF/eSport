import Hero from "@/components/Hero";
import FeaturedTournaments from "@/components/FeaturedTournaments";
import Features from "@/components/Features";
import PlayerCard from "@/components/PlayerCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <FeaturedTournaments />
      
      {/* Featured Athletes Section (Step 3 Showcase) */}
      <section className="py-24 bg-background overflow-hidden relative">
        {/* Background glow for player card section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 blur-[150px] -z-10" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center space-x-2 glass-pill px-4 py-1.5 border border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-purple">Step 3: Viral Identity</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-tight">
                CREATE YOUR <br />
                <span className="text-accent-blue">LEGACY CARD</span>.
              </h2>
              <p className="text-muted-foreground text-lg">
                Your career is more than just raw stats. Showcase your achievements with a viral, 3D collectible card. 
                Move your mouse over the card to see the 3D tilt effect!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-accent-purple text-white font-bold glow-purple transition-all hover:scale-105 active:scale-95">
                  Design Your Card
                </button>
                <div className="flex items-center space-x-3 text-muted-foreground font-bold uppercase tracking-widest text-xs">
                  <span>Customizable Tiers</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <div className="w-3 h-3 rounded-full bg-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase the Player Card with tilt effect */}
            <div className="relative">
              <PlayerCard 
                name="ASTRAL_PRO"
                rating={94}
                position="Entry Fragger"
                team="Global Elite"
                stats={[
                  { label: "Aim", value: "98" },
                  { label: "IQ", value: "92" },
                  { label: "Clutch", value: "95" },
                ]}
                image="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=800"
                tier="Gold"
              />
              
              {/* Floating Decoration */}
              <div className="absolute -bottom-8 -right-8 glass p-4 rounded-2xl border border-border/50 shadow-2xl animate-bounce">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Current Rating</p>
                <p className="text-2xl font-black text-accent-blue tracking-tighter">#1 WORLDWIDE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />
      
      {/* Visual CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-blue/5 -z-10" />
        <div className="container mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">READY TO DOMINATE?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-4">
            Join thousands of players already competing in the arena. Your journey to pro starts here.
          </p>
          <button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-foreground text-background font-black text-lg sm:text-xl hover:scale-105 transition-all shadow-2xl">
            JOIN MATCHPOINT NOW
          </button>
        </div>
      </section>
    </div>
  );
}
