"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Trophy, ArrowRight } from "lucide-react";

interface TournamentCardProps {
  game: string;
  title: string;
  prizePool: string;
  participants: string;
  date: string;
  status: "Live" | "Upcoming" | "Finished";
  image: string;
  icon: React.ReactNode;
}

const TournamentCard = ({ game, title, prizePool, participants, date, status, image, icon }: TournamentCardProps) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex-shrink-0 w-[320px] rounded-3xl overflow-hidden glass border border-border/50 hover:border-accent-blue/50 transition-all duration-300 shadow-xl"
    >
      {/* Background Image with Overlay */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-muted/50 to-muted dark:from-muted dark:to-background">
        {!imageError ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 glass border ${
            status === "Live" ? "border-red-500/50 text-red-500" : 
            status === "Upcoming" ? "border-accent-blue/50 text-accent-blue" : 
            "border-muted-foreground/50 text-muted-foreground"
          }`}>
            {status === "Live" && <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>}
            <span>{status}</span>
          </div>
        </div>

        {/* Game Icon */}
        <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl glass flex items-center justify-center text-foreground">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-blue mb-1">{game}</p>
          <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-accent-blue transition-colors">
            {title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Prize Pool</p>
            <p className="text-foreground font-black flex items-center space-x-1 text-sm">
              <Trophy size={14} className="text-accent-purple" />
              <span>{prizePool}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-bold">Teams</p>
            <p className="text-foreground font-black flex items-center space-x-1 text-sm">
              <Users size={14} className="text-accent-blue" />
              <span>{participants}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar size={14} />
            <span className="text-xs font-semibold">{date}</span>
          </div>
          <button className="flex items-center space-x-1 text-accent-blue text-xs font-bold uppercase tracking-widest group/btn hover:translate-x-1 transition-transform">
            <span>Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
