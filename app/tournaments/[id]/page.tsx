"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Info, Users, BarChart2, Shield } from "lucide-react";
import { TOURNAMENTS } from "@/lib/mock-data";
import TournamentHero from "@/components/tournament/TournamentHero";
import TournamentTabs from "@/components/tournament/TournamentTabs";
import StandingsTable from "@/components/tournament/StandingsTable";

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Standings");

  // Find the tournament from mock data
  const tournament = TOURNAMENTS.find((t) => t.id === id) || TOURNAMENTS[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back Button */}
      <div className="absolute top-28 left-6 z-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-500 hover:text-foreground transition-colors group"
        >
          <div className="p-2 glass rounded-lg border border-foreground/10 group-hover:bg-foreground/10 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Back to Arena</span>
        </button>
      </div>

      <TournamentHero tournament={tournament} />

      <div className="container mx-auto px-6 mt-8">
        <TournamentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
             {activeTab === "Standings" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Group Stage Standings</h2>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-widest glass px-4 py-2 rounded-full border border-foreground/5">
                      <Info size={14} />
                      <span>Last Updated: 2m ago</span>
                    </div>
                  </div>
                  <StandingsTable data={tournament.standings} />
                </div>
             )}

             {(activeTab === "Overview" || activeTab === "Bracket" || activeTab === "Participants" || activeTab === "Statistics") && (
                <div className="py-20 flex flex-col items-center justify-center glass rounded-3xl border border-dashed border-foreground/20 text-center space-y-4">
                   <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center text-slate-500">
                     <BarChart2 size={32} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-foreground">Phase 1 Placeholder</h3>
                     <p className="text-slate-500 max-w-xs">Detailed {activeTab} views will be implemented in Phase 2 including live bracket trees and player statistics.</p>
                   </div>
                </div>
             )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
             {/* Rules Card */}
             <div className="glass rounded-3xl p-8 border border-foreground/5 space-y-6">
                <div className="flex items-center space-x-3 text-accent-purple">
                  <Shield size={24} />
                   <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Rules & Info</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-foreground/5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Match Format</p>
                    <p className="text-foreground font-bold">Best of 3 (BO3)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-foreground/5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Server Region</p>
                    <p className="text-foreground font-bold">Europe Central</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-foreground/5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Anti-Cheat</p>
                    <p className="text-foreground font-bold">Vanguard Required</p>
                  </div>
                </div>
                <button className="w-full py-4 rounded-2xl border border-foreground/10 text-foreground font-bold hover:bg-foreground/5 transition-colors uppercase tracking-widest text-xs">
                  Download Full Rulebook
                </button>
             </div>

             {/* Registered Teams */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Recent Signups</h3>
                   <Users size={16} className="text-slate-500" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl glass border border-foreground/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800" />
                        <span className="text-sm font-bold text-foreground">Team Alpha {i}</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-500 uppercase">Registered</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;
