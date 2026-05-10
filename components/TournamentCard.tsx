"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Trophy, ArrowRight } from "lucide-react";
import Link from 'next/link';

interface TournamentCardProps {
  game: string;
  title: string;
  prizePool: string;
  participants: string;
  date: string;
  status: "Live" | "Upcoming" | "Finished";
  image: string;
  icon: React.ReactNode;
  link: string;
}

const TournamentCard = ({ game, title, prizePool, participants, date, status, image, icon, link }: TournamentCardProps) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Link href={link} className="block">
      <motion.div
        whileHover={{ y: -20, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group relative flex-shrink-0 w-[85vw] max-w-[320px] rounded-[2.5rem] overflow-hidden luxury-glass border border-white/20 shadow-3d transition-all duration-500 transform-gpu shimmer-glint luxury-border-glow bg-card [backface-visibility:hidden]"
      >
        {/* Background Image with Overlay */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-muted/50 to-muted dark:from-muted dark:to-background">
          {!imageError ? (
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-blue/20 to-accent-purple/20">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-accent-blue/30 rounded-full" />
                <div className="relative z-10 opacity-30 group-hover:opacity-50 transition-opacity">
                  {icon}
                </div>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-5 right-5 z-20">
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-2 glass border shadow-lg ${
              status === "Live" ? "border-red-500/30 bg-red-500/10 text-red-500" : 
              status === "Upcoming" ? "border-accent-blue/30 bg-accent-blue/10 text-accent-blue" : 
              "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground"
            }`}>
              {status === "Live" && <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>}
              <span>{status}</span>
            </div>
          </div>

          {/* Game Icon */}
          <div className="absolute bottom-4 left-6 w-12 h-12 rounded-2xl glass flex items-center justify-center text-foreground z-20 border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="relative z-20">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-blue mb-2 opacity-80">{game}</p>
            <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-accent-blue transition-colors duration-300">
              {title}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 py-5 border-y border-foreground/5">
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black opacity-60">Prize Pool</p>
              <p className="text-foreground font-black flex items-center space-x-2 text-base">
                <Trophy size={16} className="text-accent-purple" />
                <span className="tracking-tight">{prizePool}</span>
              </p>
            </div>
            <div className="space-y-1.5 pl-4 border-l border-foreground/5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-black opacity-60">Teams</p>
              <p className="text-foreground font-black flex items-center space-x-2 text-base">
                <Users size={16} className="text-accent-blue" />
                <span className="tracking-tight">{participants}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-muted/50 text-muted-foreground border border-foreground/5">
              <Calendar size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{date}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-foreground text-background px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-accent-blue group-hover:text-white transition-all shadow-lg hover:shadow-accent-blue/20 transform group-hover:-translate-y-1 active:scale-95">
              <span>Join</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default TournamentCard;
