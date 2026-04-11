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

const FeaturedTournaments = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              COMPETE IN THE <span className="text-accent-blue">ARENA</span>.
            </h2>
            <p className="text-slate-500 font-medium max-w-xl">
              Join the most competitive tournaments in the world. Win massive prizes and build your legacy.
            </p>
          </div>
          
          <div className="flex space-x-2 hidden md:flex">
            <button 
              onClick={() => scroll("left")}
              className="p-3 rounded-full glass border border-foreground/10 hover:bg-foreground/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-3 rounded-full glass border border-foreground/10 hover:bg-foreground/10 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockTournaments.map((tournament, idx) => (
            <div key={idx} className="snap-center">
              <TournamentCard {...tournament} />
            </div>
          ))}
        </div>
        
        {/* Mobile Swipe Hint */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold animate-pulse">
            Swipe to explore →
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
