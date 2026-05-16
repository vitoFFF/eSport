"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, CreditCard, ChevronRight, Play, Gamepad2, Users, Star, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[650px] lg:min-h-[750px] flex flex-col justify-center pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-background" />


      <div className="container mx-auto px-6 lg:px-12 relative z-20 w-full flex-grow flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full glass border border-white/5 shadow-lg backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/70">{t("hero.badge")}</span>
            </div>

            <div className="space-y-2 md:space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                {t("hero.title")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-pink-500">{t("hero.titleAccent")}</span>.
              </h1>
              <p className="text-base md:text-lg lg:text-xl font-medium text-slate-400 max-w-lg leading-relaxed">
                {t("hero.description")}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="group relative px-7 py-3.5 rounded-xl bg-foreground text-background font-bold uppercase tracking-wider text-[11px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-center space-x-2 group-hover:text-white transition-colors">
                  <Trophy size={16} />
                  <span>{t("hero.explore")}</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button className="group px-7 py-3.5 rounded-xl luxury-glass border border-white/10 text-foreground font-bold uppercase tracking-wider text-[11px] transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-accent-purple" />
                  <span>{t("hero.joinPro")}</span>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-6 pt-6 border-t border-white/5 w-fit">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden shadow-md">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1 text-amber-500/80">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill="currentColor" />)}
                </div>
                <p className="text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
                  {t("hero.trustedBy")} <span className="text-foreground">20k+</span> {t("hero.pros")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Refined Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block translate-y-12 perspective-2000"
          >
            <motion.div 
              whileHover={{ 
                rotateY: -5, 
                rotateX: 5,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="relative z-10 luxury-glass rounded-[2rem] p-8 xl:p-10 border border-white/10 shadow-3d backdrop-blur-3xl bg-card/80 max-w-[520px] ml-auto overflow-hidden group select-none"
            >
              {/* Decorative Mesh Gradient Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-conic from-accent-blue via-accent-purple to-pink-500 blur-3xl animate-spin-slow" />
              </div>
              
              {/* Decorative Glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-blue/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent-blue/30 transition-colors duration-700" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-purple to-pink-500 flex items-center justify-center shadow-lg relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 blur-lg bg-accent-blue/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Gamepad2 className="text-white relative z-10" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight leading-tight">{t("hero.featuredEvent")}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-blue">{t("hero.globalQualifiers")}</p>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("hero.season")} 4</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.15em] flex items-center space-x-2 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{t("common.liveNow")}</span>
                </div>
              </div>

              <div className="aspect-video rounded-2xl bg-black/40 mb-8 overflow-hidden relative group/video border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
                  alt="Tournament"
                  className="w-full h-full object-cover opacity-70 group-hover/video:scale-110 transition-transform duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full glass border border-white/30 flex items-center justify-center text-white shadow-2xl backdrop-blur-md scale-90 group-hover/video:scale-100 transition-transform duration-500">
                    <Play className="fill-current ml-1" size={24} />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="px-2 py-0.5 rounded bg-accent-blue/90 text-white text-[8px] font-bold uppercase tracking-widest w-fit">Grand Finale</div>
                    <p className="text-white font-bold text-sm text-shadow-3d">League of Legends Masters</p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-white/80">
                    <Users size={14} />
                    <span className="text-[10px] font-bold">12.4k {t("hero.watching")}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 relative z-10">
                {[
                  { label: t("hero.prizePool"), value: "$25,000", color: "text-amber-400", sub: "USD" },
                  { label: t("hero.slotsFilled"), value: "112 / 128", color: "text-accent-blue", sub: "Teams" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-colors group/stat">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-[0.1em] mb-2">{stat.label}</p>
                    <div className="flex items-baseline space-x-1.5">
                      <p className={`text-2xl font-black ${stat.color} tracking-tight group-hover:scale-105 transition-transform`}>{stat.value}</p>
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 group/btn shadow-xl relative overflow-hidden shimmer-glint">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10">{t("hero.joinTournament")}</span>
                <ArrowUpRight size={18} className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </motion.div>

            {/* Subtle floating accent */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5, 
                ease: "easeInOut" 
              }}
              className="absolute -top-8 -right-8 w-24 h-24 glass rounded-3xl border border-white/20 flex items-center justify-center text-accent-blue shadow-2xl z-20 backdrop-blur-xl group"
            >
              <div className="absolute inset-0 bg-accent-blue/10 rounded-3xl animate-pulse" />
              <Trophy size={40} className="relative z-10 drop-shadow-glow" />
            </motion.div>
          </motion.div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
