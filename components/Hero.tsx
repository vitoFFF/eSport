"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, CreditCard, ChevronRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-accent-purple/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-accent-blue/20 blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none -z-[5]" />

      <div className="container mx-auto px-6 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 pt-12"
          >
  
  
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
              ELEVATE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple">GAME</span>. <br />
              DOMINATE THE ARENA.
            </h1>
  
            <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground max-w-xl leading-relaxed">
              The ultimate platform for competitive players. Weekly tournaments, and massive prize pools await.
            </p>
  
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="w-full sm:w-auto group flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-accent-blue text-white font-bold text-[15px] sm:text-lg glow-blue hover:bg-blue-600 transition-all active:scale-95">
                <Trophy size={22} />
                <span>Find a Tournament</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-full glass text-white font-bold text-[15px] sm:text-lg hover:bg-white/10 transition-all active:scale-95">
                <CreditCard size={22} />
                <span>Create Player Card</span>
              </button>
            </div>

          <div className="flex items-center space-x-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden shadow-xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-bold">12k+</span> players already competing
            </p>
          </div>
        </motion.div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden md:block overflow-hidden rounded-3xl p-4 max-w-[32rem] ml-auto lg:mr-8 xl:mr-16"
        >
          {/* Mock UI Element */}
          <div className="relative z-10 glass rounded-3xl p-6 border border-border/50 shadow-2xl hover:skew-y-0 hover:rotate-0 transition-all duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-accent-purple flex items-center justify-center glow-purple">
                  <Play className="text-white fill-current" size={20} />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">VALORANT PRO LEAGUE</h3>
                  <p className="text-xs text-muted-foreground">Live Now · 2,492 Watching</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                Live
              </div>
            </div>

            <div className="aspect-video rounded-2xl bg-black/40 mb-6 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
                alt="Game"
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play className="fill-current" size={24} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Prize Pool", value: "$5,000" },
                { label: "Teams", value: "32/64" },
                { label: "Tier", value: "Master" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted/50 rounded-xl p-3 border border-border/20">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">{stat.label}</p>
                  <p className="text-foreground font-black">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Accents */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-0 right-0 w-20 h-20 glass rounded-2xl border border-border/20 flex items-center justify-center text-accent-blue rotate-12"
          >
            <Trophy size={36} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute bottom-0 left-0 w-28 h-28 glass rounded-2xl border border-border/20 p-4 -rotate-12"
          >
            <div className="w-full h-4 bg-muted/40 rounded mb-2" />
            <div className="w-2/3 h-4 bg-accent-purple/20 rounded mb-4" />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="w-12 h-6 bg-accent-blue/30 rounded" />
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
