import React from "react";
import Link from "next/link";
import { Trophy, Calendar, Users as UsersIcon, Filter, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function TournamentsCategoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const rawCategory = (resolvedParams?.category as string) || "all";
  const category = rawCategory.toLowerCase();

  let query = supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data: dbTournaments } = await query;

  // Dynamic Theme Configuration for visuals
  const categoryConfig: Record<string, any> = {
    football: {
      title: "SHATTER THE PITCH",
      subtitle: "Elite 11v11 and 5v5 global football tournaments.",
      gradient: "from-emerald-400 to-green-600",
      pillBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      mockImage: "https://images.unsplash.com/photo-1518605368461-1ee12db80fa5?auto=format&fit=crop&q=80&w=1200",
    },
    esport: {
      title: "DIGITAL DOMINANCE",
      subtitle: "The ultimate competitive gaming platform.",
      gradient: "from-accent-blue to-accent-purple",
      pillBg: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
      mockImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
    },
    all: {
      title: "BROWSE ALL TOURNAMENTS",
      subtitle: "Explore global events across traditional sports and eSports.",
      gradient: "from-slate-400 to-slate-600",
      pillBg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      mockImage: "https://images.unsplash.com/photo-1461896836934-ffe607fa8211?auto=format&fit=crop&q=80&w=1200",
    }
  };

  const config = categoryConfig[category] || categoryConfig["all"];

  // Map DB tournaments to the UI format
  const tournaments = dbTournaments?.map(t => ({
    id: t.id,
    name: t.name,
    prize: t.prize_pool || "TBD",
    date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
    format: "TBD", // Could be added to schema later
    image: t.banner_url || config.mockImage
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 max-w-7xl mx-auto flex justify-end opacity-20 dark:opacity-30 pointer-events-none -z-10">
          <div className="w-2/3 h-full mix-blend-overlay">
            <img src={config.mockImage} alt="Background" className="w-full h-full object-cover rounded-l-full blur-[2px] mask-image-gradient" />
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 ${config.pillBg}`}>
              <span>{category.toUpperCase()} CATEGORY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1] text-foreground mb-6">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                {config.title}
              </span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed mb-8">
              {config.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/50">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {["All", "Registration Open", "Ongoing", "Completed"].map((filter, i) => (
                <button key={i} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}>
                  {filter}
                </button>
              ))}
            </div>
            
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border/50 shadow-sm text-sm font-bold text-foreground hover:bg-muted transition-all">
              <Filter size={16} />
              Advanced Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.length > 0 ? tournaments.map((event: any, idx: number) => (
              <Link 
                key={idx} 
                href={`/tournaments/${event.id}`}
                className="group relative rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:border-border transition-all duration-500 block"
              >
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    event.status === 'Open' ? 'bg-emerald-500 text-white' :
                    event.status === 'Filling' ? 'bg-amber-500 text-white' :
                    'bg-slate-800 text-slate-100 dark:bg-slate-100 dark:text-slate-800'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="aspect-[4/3] w-full bg-muted overflow-hidden relative">
                  <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl border border-white/10 text-white">
                      <UsersIcon size={14} />
                      <span className="text-xs font-bold">{event.format}</span>
                    </div>
                    <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl border border-white/10 text-white">
                      <Calendar size={14} />
                      <span className="text-xs font-bold">{event.date}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-accent-blue transition-colors line-clamp-1">
                    {event.name}
                  </h3>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Prize Pool</p>
                      <p className="text-lg font-black text-foreground">{event.prize}</p>
                    </div>
                    
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-foreground text-background group-hover:-rotate-45 transition-transform duration-300`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-border bg-muted/20">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium italic">No tournaments found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
