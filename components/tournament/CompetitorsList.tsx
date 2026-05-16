'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

interface CompetitorsListProps {
  registrations: any[];
  participationMode: string;
}

export default function CompetitorsList({ registrations, participationMode }: CompetitorsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialCount = 4;
  const hasMore = registrations.length > initialCount;
  const displayedRegistrations = isExpanded ? registrations : registrations.slice(0, initialCount);

  if (!registrations || registrations.length === 0) {
    return (
      <div className="py-20 text-center rounded-[2rem] border border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/10">
        <Users className="text-muted-foreground/20 mb-4 h-16 w-16" />
        <p className="text-muted-foreground font-bold italic text-lg text-shadow-sm">
          The arena is empty. Be the first to register.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500">
        {displayedRegistrations.map((reg: any) => (
          <Link 
            href={reg.team_id ? `/teams/${reg.team_id}` : "#"} 
            key={reg.id} 
            className={`p-5 rounded-2xl bg-muted/30 border border-border flex items-center gap-4 transition-all ${reg.team_id ? 'hover:border-accent-blue/50 hover:bg-muted/60 hover:translate-x-1' : ''}`}
          >
             <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                {reg.teams?.avatar_url || reg.profiles?.avatar_url ? (
                   <img src={reg.teams?.avatar_url || reg.profiles?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users className="text-white/40" size={24} />
                )}
             </div>
             <div>
               <p className="font-bold text-lg leading-tight">
                 {participationMode === 'team' || participationMode === 'Team NvN' 
                   ? reg.teams?.name 
                   : (reg.profiles?.username || reg.profiles?.full_name || 'Unknown Player')}
               </p>
               <p className="text-[11px] uppercase font-black text-emerald-500 tracking-widest mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Confirmed Entry
                  {reg.details?.group_index !== undefined && reg.details?.group_index !== null && (
                    <span className={`ml-2 px-2 py-0.5 rounded-md border ${reg.details.group_index === 0 ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' : 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'}`}>
                      Group {String.fromCharCode(65 + reg.details.group_index)}
                    </span>
                  )}
               </p>
             </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-4 rounded-2xl border border-border bg-card/40 hover:bg-muted/50 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent-blue transition-colors">
            {isExpanded ? 'Show Less' : `View All Competitors (${registrations.length})`}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-accent-blue" />
          ) : (
            <ChevronDown size={16} className="text-accent-blue animate-bounce" />
          )}
        </button>
      )}
    </div>
  );
}
