import React from "react";
import { Users, Search, Plus, Star, Shield, Target } from "lucide-react";

export default function TeamsPage() {
  const teams = [
    { id: 1, name: "Cloud9", rank: 1, game: "Valorant", winRate: "78%", region: "NA", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=c9" },
    { id: 2, name: "Sentinels", rank: 2, game: "Valorant", winRate: "74%", region: "NA", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=sen" },
    { id: 3, name: "Fnatic", rank: 3, game: "CS:GO", winRate: "82%", region: "EU", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=fnc" },
    { id: 4, name: "Team Liquid", rank: 4, game: "Dota 2", winRate: "65%", region: "EU", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=tl" },
    { id: 5, name: "LOUD", rank: 5, game: "Valorant", winRate: "70%", region: "BR", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=loud" },
    { id: 6, name: "T1", rank: 6, game: "League of Legends", winRate: "88%", region: "KR", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=t1" },
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Teams Directory</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Manage and invite professional teams to your events.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-background border border-border px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95">
          <Plus size={18} />
          Register Team
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          placeholder="Search teams by name or region..." 
          className="w-full bg-card border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-purple/50 shadow-sm transition-all"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="group relative flex flex-col rounded-3xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-xl hover:border-accent-purple/30 transition-all duration-300">
            {/* Top Accent */}
            <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between">
              <div className="flex h-16 w-16 overflow-hidden rounded-2xl border-2 border-border/30 bg-muted">
                <img src={team.avatar} alt={team.name} className="h-full w-full object-cover p-2" />
              </div>
              <div className="flex flex-col items-end">
                <span className="flex items-center text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <Star size={14} className="mr-1 text-amber-500" />
                  Rank #{team.rank}
                </span>
                <span className="mt-1 rounded bg-muted/50 px-2 py-0.5 text-[10px] font-bold text-foreground border border-border/30">
                  {team.region}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-black text-foreground">{team.name}</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-1">{team.game} Professional Division</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Target size={12} className="mr-1" /> Win Rate
                </span>
                <span className="mt-1 text-lg font-black text-foreground">{team.winRate}</span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Shield size={12} className="mr-1" /> Roster
                </span>
                <div className="mt-1 flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-muted overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${team.name}${i}`} alt="player" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
