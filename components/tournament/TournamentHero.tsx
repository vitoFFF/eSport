"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Eye, Play } from "lucide-react";

interface TournamentHeroProps {
  tournament: {
    title: string;
    game: string;
    banner: string;
    status: string;
    prizePool: string;
    stats: {
      participants: number;
      viewers: string;
      round: string;
    };
    sponsors: string[];
  };
}

const TournamentHero = ({ tournament }: TournamentHeroProps) => {
  return (
    <div className="relative w-full min-h-[500px] pt-24 flex items-end overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0 -z-10">
        <img src={tournament.banner} alt={tournament.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl"
          >
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded bg-accent-blue/20 text-accent-blue text-[10px] font-black uppercase tracking-[0.2em] border border-accent-blue/30">
                {tournament.game}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <div className="flex items-center space-x-1.5 text-red-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">{tournament.status}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl glass border border-foreground/10 text-accent-purple">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Prize Pool</p>
                  <p className="text-xl font-black text-foreground tracking-tighter italic">{tournament.prizePool}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl glass border border-foreground/10 text-accent-blue">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Participants</p>
                  <p className="text-xl font-black text-foreground tracking-tighter italic">{tournament.stats.participants} TEAMS</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl glass border border-foreground/10 text-red-500">
                  <Eye size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Watching</p>
                  <p className="text-xl font-black text-foreground tracking-tighter italic">{tournament.stats.viewers} LIVE</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sponsors / Call to Action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center md:items-end space-y-6"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-tr from-accent-blue to-accent-purple">
              <button className="px-10 py-5 rounded-[14px] bg-slate-950 text-white font-black text-xl hover:bg-transparent transition-colors flex items-center space-x-3">
                <Play size={24} className="fill-current" />
                <span>WATCH LIVE</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Official Partners</p>
               {tournament.sponsors.map(s => (
                 <span key={s} className="text-xs font-black text-foreground/40 uppercase tracking-tighter italic">{s}</span>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHero;
