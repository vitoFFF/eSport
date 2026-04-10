import React from "react";
import { Search, Filter, Plus, MoreVertical, Trophy, Calendar } from "lucide-react";

export default function TournamentsPage() {
  const tournaments = [
    { id: 1, name: "VALORANT Pro League - Season 5", game: "Valorant", status: "Ongoing", prize: "$50,000", teams: "32/32", date: "Oct 12 - Nov 30" },
    { id: 2, name: "CS:GO Winter Major 2026", game: "CS:GO", status: "Registration", prize: "$100,000", teams: "12/64", date: "Dec 05 - Dec 20" },
    { id: 3, name: "League of Legends Amateur Cup", game: "League of Legends", status: "Completed", prize: "$5,000", teams: "16/16", date: "Sep 01 - Sep 15" },
    { id: 4, name: "Rocket League 3v3 Showdown", game: "Rocket League", status: "Ongoing", prize: "$10,000", teams: "8/8", date: "Oct 20 - Nov 05" },
    { id: 5, name: "Dota 2 International Qualifiers", game: "Dota 2", status: "Registration", prize: "$25,000", teams: "20/32", date: "Nov 10 - Nov 25" },
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Tournaments</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Manage your organization's events and championships.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95">
          <Plus size={18} />
          New Tournament
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search tournaments..." 
            className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted/80">
            <Filter size={16} />
            Status
          </button>
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted/80">
            <Calendar size={16} />
            Date
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Event Details</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs hidden md:table-cell">Prize Pool</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Teams</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{t.name}</h4>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{t.game} · {t.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ${
                      t.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      t.status === 'Registration' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black hidden md:table-cell text-foreground">
                    {t.prize}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{t.teams}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-blue" 
                          style={{ width: `${(parseInt(t.teams.split('/')[0]) / parseInt(t.teams.split('/')[1])) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
