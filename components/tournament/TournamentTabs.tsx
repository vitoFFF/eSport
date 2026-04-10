"use client";

import React from "react";
import { motion } from "framer-motion";

const tabs = ["Overview", "Standings", "Bracket", "Participants", "Statistics"];

interface TournamentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TournamentTabs = ({ activeTab, setActiveTab }: TournamentTabsProps) => {
  return (
    <div className="flex items-center space-x-2 md:space-x-8 border-b border-foreground/5 overflow-x-auto no-scrollbar scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative py-6 px-1 text-sm font-bold uppercase tracking-widest transition-colors ${
            activeTab === tab ? "text-accent-blue" : "text-slate-500 hover:text-foreground"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-accent-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default TournamentTabs;
