"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Shield, Trophy } from "lucide-react";

interface PlayerCardProps {
  name: string;
  rating: number;
  position: string;
  team: string;
  stats: { label: string; value: string }[];
  image: string;
  tier: "Gold" | "Silver" | "Bronze";
}

const PlayerCard = ({ name, rating, position, team, stats, image, tier }: PlayerCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const tierColors = {
    Gold: "from-yellow-400 via-amber-500 to-yellow-600",
    Silver: "from-slate-300 via-slate-400 to-slate-500",
    Bronze: "from-orange-500 via-orange-600 to-orange-700",
  };

  const glowColors = {
    Gold: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    Silver: "shadow-[0_0_30px_rgba(148,163,184,0.3)]",
    Bronze: "shadow-[0_0_30px_rgba(194,65,12,0.3)]",
  };

  return (
    <div 
      className="perspective-1000 py-12 flex justify-center items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative w-[300px] h-[420px] rounded-[2rem] p-4 ${glowColors[tier]} transition-shadow duration-500 cursor-pointer overflow-hidden group`}
      >
        {/* Card Background Layer */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tierColors[tier]} opacity-90`} />
        
        {/* Animated Shine Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none z-10"
          animate={{
            x: isHovered ? ["-100%", "200%"] : "-100%",
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />

        {/* Card Content Overlay */}
        <div className="absolute inset-[2px] rounded-[1.9rem] bg-[#05080f]/90 z-20 overflow-hidden flex flex-col">
          {/* Header Stats */}
          <div className="p-4 flex items-start justify-between">
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${tierColors[tier]}`}>
                {rating}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{position}</span>
              <div className="mt-2 w-6 h-4 bg-muted rounded sm border border-border/10 overflow-hidden">
                <img src="https://flagcdn.com/w40/us.png" alt="Region" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 opacity-40">
              <Shield size={20} className="text-white" />
              <Star size={18} className="text-white" />
              <Trophy size={18} className="text-white" />
            </div>
          </div>

          {/* Player Identity Layer */}
          <div className="flex-grow relative flex items-center justify-center -mt-8">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-40" />
             <img 
               src={image} 
               alt={name} 
               className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700 hover:rotate-2"
             />
          </div>

          {/* Bottom Data Layer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-background to-transparent">
            <h3 className="text-2xl font-black text-center text-white italic tracking-tighter uppercase mb-2">
              {name}
            </h3>
            <div className="grid grid-cols-3 gap-2 border-t border-border/20 pt-3">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{stat.label}</p>
                  <p className={`text-sm font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${tierColors[tier]}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outer Glow Effect on Hover */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${tierColors[tier]} rounded-[2.1rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
      </motion.div>
    </div>
  );
};

export default PlayerCard;
