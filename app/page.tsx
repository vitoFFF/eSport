import Hero from "@/components/Hero";
import FeaturedTournaments from "@/components/FeaturedTournaments";
import Features from "@/components/Features";
import PlayerCard from "@/components/PlayerCard";
import AIChat from "@/components/AIChat";

import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: dbTournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <FeaturedTournaments dbTournaments={dbTournaments || []} />
      
      {/* Featured Athletes Section */}
      <section className="relative py-16 bg-background overflow-hidden">
        {/* Large background decorative text */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[16rem] font-black text-foreground/[0.02] select-none pointer-events-none tracking-tighter mix-blend-overlay leading-none">
          CARD
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16 xl:gap-24">

            {/* Left: Text Content */}
            <div className="max-w-2xl space-y-8 relative z-50">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase italic leading-[1.1] mb-2">
                CREATE YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-pink-500 to-accent-blue drop-shadow-sm">LEGACY CARD</span>.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-accent-purple/20 pl-6">
                Your career is more than just raw stats. Showcase your achievements with a viral, 3D collectible card that represents your legacy.
              </p>

              <div className="space-y-4 pt-2">
                <button className="group flex items-center space-x-3 bg-foreground text-background px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent-purple hover:text-white transition-all duration-300 shadow-xl hover:shadow-accent-purple/20 transform hover:-translate-y-1 active:scale-95">
                  <span>Design Your Card</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <div className="flex items-center space-x-4 pl-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Tiers</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Gold</span>
                    </div>
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-400/30 bg-slate-400/5">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Silver</span>
                    </div>
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-orange-600/30 bg-orange-600/5">
                      <div className="w-2 h-2 rounded-full bg-orange-600" />
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Bronze</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Player Card Showcase */}
            <div className="relative flex-shrink-0 w-full md:w-[600px] h-[500px] flex items-center justify-center">
              {/* Bronze Card (Back Left) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-12 scale-90 opacity-40 hover:opacity-100 hover:scale-100 hover:z-50 transition-all duration-500 z-10">
                <PlayerCard 
                  name="NOVA_REACH"
                  rating={78}
                  position="Support"
                  team="Rising Stars"
                  stats={[
                    { label: "Aim", value: "75" },
                    { label: "IQ", value: "85" },
                    { label: "Clutch", value: "70" },
                  ]}
                  image="/images/players/bronze.png"
                  tier="Bronze"
                />
              </div>

              {/* Silver Card (Back Right) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-12 scale-90 opacity-40 hover:opacity-100 hover:scale-100 hover:z-50 transition-all duration-500 z-20">
                <PlayerCard 
                  name="VORTEX_XP"
                  rating={86}
                  position="Lurker"
                  team="Silver Serpents"
                  stats={[
                    { label: "Aim", value: "82" },
                    { label: "IQ", value: "88" },
                    { label: "Clutch", value: "89" },
                  ]}
                  image="/images/players/silver.png"
                  tier="Silver"
                />
              </div>

              {/* Gold Card (Center Front) */}
              <div className="relative z-30 transform hover:scale-105 transition-all duration-500">
                <PlayerCard 
                  name="KAIROS_ONE"
                  rating={96}
                  position="Entry Fragger"
                  team="Nexus Elite"
                  stats={[
                    { label: "Aim", value: "98" },
                    { label: "IQ", value: "94" },
                    { label: "Clutch", value: "97" },
                  ]}
                  image="/images/players/gold.png"
                  tier="Gold"
                />
                
                {/* Floating Rank Tag */}
                <div className="absolute -bottom-4 -right-12 luxury-glass p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Global Rank</p>
                  <p className="text-xl font-black text-accent-blue tracking-tighter">#1 WORLDWIDE</p>
                </div>
              </div>

              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-purple/20 blur-[120px] rounded-full -z-10" />
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-blue/10 blur-[100px] rounded-full -z-10" />
            </div>

          </div>
        </div>
      </section>

      <Features />
      
      {/* Visual CTA Section */}
      <section className="py-16 relative overflow-hidden">
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

      <AIChat />
    </div>
  );
}
