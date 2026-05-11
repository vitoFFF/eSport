"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gamepad2, Swords, ShieldCheck, Target } from "lucide-react";
import TournamentCard from "./TournamentCard";

const mockTournaments = [
  {
    game: "VALORANT",
    title: "Challengers Series: EMEA",
    prizePool: "$25,000",
    participants: "32/64",
    date: "Starts in 2h",
    status: "Live" as const,
    image: "https://images.unsplash.com/photo-1614050306723-3230dee622c0?auto=format&fit=crop&q=80&w=800",
    icon: <Target size={20} />,
  },
  {
    game: "League of Legends",
    title: "Summoner's Cup: Spring",
    prizePool: "$50,000",
    participants: "128/128",
    date: "April 15, 2026",
    status: "Upcoming" as const,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    icon: <Swords size={20} />,
  },
  {
    game: "CS:GO 2",
    title: "Major Championship Berlin",
    prizePool: "$100,000",
    participants: "16/16",
    date: "March 20, 2026",
    status: "Finished" as const,
    image: "https://images.unsplash.com/photo-1552824236-077b9df3395c?auto=format&fit=crop&q=80&w=800",
    icon: <ShieldCheck size={20} />,
  },
  {
    game: "Dota 2",
    title: "The International Regional",
    prizePool: "$15,000",
    participants: "24/48",
    date: "April 20, 2026",
    status: "Upcoming" as const,
    image: "https://images.unsplash.com/photo-1534423861386-8571ec9967bd?auto=format&fit=crop&q=80&w=800",
    icon: <Gamepad2 size={20} />,
  },
  {
    game: "Rocket League",
    title: "RLCS Winter Open",
    prizePool: "$10,000",
    participants: "64/64",
    date: "March 25, 2026",
    status: "Finished" as const,
    image: "https://images.unsplash.com/photo-1605898835373-023be2a7455a?auto=format&fit=crop&q=80&w=800",
    icon: <Target size={20} />,
  },
];

interface FeaturedTournamentsProps {
  dbTournaments?: any[];
}

const FeaturedTournaments = ({ dbTournaments = [] }: FeaturedTournamentsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const displayTournaments = dbTournaments.length > 0 ? dbTournaments.map(t => ({
    game: t.category.toUpperCase(),
    title: t.name,
    prizePool: t.prize_pool || "TBD",
    participants: "Open", // Will update dynamically later based on registrations
    date: new Date(t.created_at).toLocaleDateString(),
    status: t.status.charAt(0).toUpperCase() + t.status.slice(1) as any,
    image: t.banner_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    icon: <Target size={20} />,
    link: `/tournaments/${t.id}`
  })) : mockTournaments.map(t => ({ ...t, link: '#' }));

  return (
    <section className="relative py-16 bg-background overflow-x-clip overflow-y-visible">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20rem] font-black text-foreground/[0.02] select-none pointer-events-none tracking-tighter mix-blend-overlay">
        ARENA
      </div>
      
      {/* Decorative Glows */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-8 md:space-y-0">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight uppercase italic">
              COMPETE IN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-blue-glow to-accent-purple drop-shadow-sm">ARENA</span>.
            </h2>
            <p className="text-slate-500 font-medium max-w-xl text-lg opacity-80 border-l-2 border-accent-blue/20 pl-6">
              Step into the spotlight and prove your worth. Join the world's most prestigious tournaments.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => scroll("left")}
              className="group p-4 rounded-2xl glass border border-foreground/5 hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all duration-300 shadow-xl active:scale-90"
            >
              <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform cursor-pointer" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="group p-4 rounded-2xl glass border border-foreground/5 hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all duration-300 shadow-xl active:scale-90"
            >
              <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform cursor-pointer" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto overflow-y-visible pb-12 pt-12 -mt-12 snap-x snap-mandatory scrollbar-hide no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayTournaments.map((tournament: any, idx: number) => (
            <div key={idx} className="snap-center">
              <TournamentCard {...tournament} />
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden mt-8 flex justify-center">
          <div className="px-6 py-2 rounded-full glass border border-foreground/5 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
            <span>Swipe to navigate</span>
            <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
