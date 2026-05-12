"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, CreditCard, ChevronRight, Play, Gamepad2, Users, Star, ArrowUpRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[650px] lg:min-h-[750px] flex flex-col justify-center pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(168,85,247,0.1),transparent)]" />
      </div>

      {/* Subtle Light Accents */}
      <div className="absolute top-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent-blue/10 blur-[100px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-accent-purple/10 blur-[100px] rounded-full -z-10 animate-pulse delay-700" />

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
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/70">PRO LEAGUE PLATFORM</span>
            </div>

            <div className="space-y-2 md:space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                The New Standard <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-pink-500">of Performance</span>.
              </h1>
              <p className="text-base md:text-lg lg:text-xl font-medium text-slate-400 max-w-lg leading-relaxed">
                Elevate your competitive edge on the most advanced platform for professional athletes and elite gamers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="group relative px-7 py-3.5 rounded-xl bg-foreground text-background font-bold uppercase tracking-wider text-[11px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-center space-x-2 group-hover:text-white transition-colors">
                  <Trophy size={16} />
                  <span>Explore Tournaments</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button className="group px-7 py-3.5 rounded-xl luxury-glass border border-white/10 text-foreground font-bold uppercase tracking-wider text-[11px] transition-all hover:bg-white/5 hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-accent-purple" />
                  <span>Join as Pro</span>
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
                  Trusted by <span className="text-foreground">20k+</span> Pros
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Refined Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 luxury-glass rounded-3xl p-6 xl:p-8 border border-white/10 shadow-2xl backdrop-blur-3xl bg-background/20 max-w-[480px] ml-auto overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-blue/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-accent-blue/30 transition-colors" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg">
                    <Gamepad2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">FEATURED EVENT</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent-blue">Global Qualifiers</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              <div className="aspect-video rounded-2xl bg-black/40 mb-6 overflow-hidden relative group/video border border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
                  alt="Tournament"
                  className="w-full h-full object-cover opacity-60 group-hover/video:scale-105 transition-transform duration-[1.5s]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center text-white shadow-xl backdrop-blur-md hover:scale-110 transition-transform">
                    <Play className="fill-current ml-1" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Prize Pool", value: "$25,000", color: "text-amber-500" },
                  { label: "Registered", value: "128 Teams", color: "text-accent-blue" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center space-x-2 group/btn">
                <span>View Details</span>
                <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Subtle floating accent */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-20 h-20 glass rounded-2xl border border-white/10 flex items-center justify-center text-accent-blue shadow-xl z-20 backdrop-blur-lg"
            >
              <Trophy size={32} className="opacity-80" />
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Clean Bottom Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />
    </section>
  );
};

export default Hero;
