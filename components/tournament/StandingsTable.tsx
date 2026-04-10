"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Standing {
  rank: number;
  team: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  trend: string;
}

const StandingsTable = ({ data }: { data: Standing[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden glass rounded-3xl border border-foreground/5 shadow-2xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-foreground/5 border-b border-foreground/5">
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Team</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Played</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">W</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">L</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center font-black">PTS</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr 
                key={i} 
                className="group border-b border-foreground/5 last:border-0 hover:bg-foreground/5 transition-colors cursor-default"
              >
                <td className="py-6 px-6">
                  <span className={`text-xl font-black italic tracking-tighter ${
                    row.rank <= 3 ? "text-accent-blue" : "text-foreground/40"
                  }`}>
                    {row.rank.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="py-6 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5 font-black text-slate-400">
                      {row.team.charAt(0)}
                    </div>
                    <span className="font-bold text-foreground group-hover:text-accent-blue transition-colors">{row.team}</span>
                  </div>
                </td>
                <td className="py-6 px-6 text-center font-bold text-slate-500">{row.played}</td>
                <td className="py-6 px-6 text-center font-bold text-green-500">{row.won}</td>
                <td className="py-6 px-6 text-center font-bold text-red-500">{row.lost}</td>
                <td className="py-6 px-6 text-center font-black text-foreground text-lg">{row.points}</td>
                <td className="py-6 px-6">
                  <div className="flex justify-center">
                    {row.trend === "up" && <TrendingUp size={18} className="text-green-500" />}
                    {row.trend === "down" && <TrendingDown size={18} className="text-red-500" />}
                    {row.trend === "constant" && <Minus size={18} className="text-slate-500" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StandingsTable;
