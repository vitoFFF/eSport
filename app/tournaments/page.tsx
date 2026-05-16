import React from "react";
import Link from "next/link";
import { Trophy, Calendar, Users as UsersIcon, Filter, ChevronRight, ArrowRight, Target, Swords, ShieldCheck, Gamepad2 } from "lucide-react";
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
      subtitle: "Experience the prestige of elite global football tournaments.",
      gradient: "from-emerald-400 via-emerald-500 to-amber-500",
      pillBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accent: "text-emerald-500",
      glow: "shadow-emerald-500/20",
      image: "/images/categories/football.png",
      icon: "⚽",
    },
    tennis: {
      title: "ROYAL COURT SERIES",
      subtitle: "The pinnacle of tennis excellence. Join the clay court legends.",
      gradient: "from-orange-400 via-orange-500 to-amber-200",
      pillBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      accent: "text-orange-500",
      glow: "shadow-orange-500/20",
      image: "/images/categories/tennis.png",
      icon: "🎾",
    },
    padel: {
      title: "ELITE PADEL ARENA",
      subtitle: "Modern padel tournaments in high-end glass arenas.",
      gradient: "from-blue-400 via-blue-600 to-purple-600",
      pillBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      accent: "text-blue-500",
      glow: "shadow-blue-500/20",
      image: "/images/categories/padel.png",
      icon: "🏸",
    },
    esport: {
      title: "DIGITAL DOMINANCE",
      subtitle: "The ultimate competitive stage for the world's elite gamers.",
      gradient: "from-violet-500 via-purple-500 to-cyan-400",
      pillBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      accent: "text-purple-500",
      glow: "shadow-purple-500/20",
      image: "/images/categories/esport.png",
      icon: "🎮",
    },
    all: {
      title: "THE GLOBAL ARENA",
      subtitle: "Browse all prestigious events across the sporting world.",
      gradient: "from-slate-400 via-slate-600 to-slate-800",
      pillBg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      accent: "text-slate-500",
      glow: "shadow-slate-500/20",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607fa8211?auto=format&fit=crop&q=80&w=1200",
      icon: "🏆",
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
    format: t.format || "Professional",
    image: t.banner_url || config.image,
    game: (t.settings as any)?.game || (t.category === 'esport' ? 'Competitive' : t.category)
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Luxury Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20">
        {/* Background Image with Rounded Corners */}
        <div className="absolute inset-y-0 left-2 right-2 z-0 overflow-hidden rounded-[4rem] shadow-2xl border border-white/10">
          <img
            src={config.image}
            alt={config.title}
            className="w-full h-full object-cover scale-110 brightness-[0.7] dark:brightness-[0.5] contrast-125 transition-transform duration-[10s] hover:scale-115 blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        </div>

        {/* Decorative Light Beams */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${config.gradient} opacity-20 blur-[120px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br ${config.gradient} opacity-10 blur-[100px] rounded-full animate-pulse delay-700`} />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full glass border mb-8 ${config.pillBg} luxury-border-glow`}>
              <span className="text-lg">{config.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">{category.toUpperCase()} CATEGORY</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground mb-8 text-shadow-3d">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                {config.title}
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-medium text-slate-300 dark:text-slate-400 leading-relaxed max-w-2xl border-l-4 border-white/20 pl-8 mb-10">
              {config.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-2xl luxury-glass border-white/10 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center ${config.accent}`}>
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Prize Pools</p>
                  <p className="text-xl font-black text-foreground">$1,250,000+</p>
                </div>
              </div>

              <div className="px-6 py-3 rounded-2xl luxury-glass border-white/10 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center ${config.accent}`}>
                  <UsersIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Players</p>
                  <p className="text-xl font-black text-foreground">15,000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 py-20 -mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/50 p-8 md:p-12 shadow-3d luxury-border-glow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 pb-10 border-b border-border/40">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic text-shadow-3d">Active Tournaments</h2>
                <p className="text-muted-foreground font-medium">Browse and register for the upcoming prestige events.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar glass-pill p-1.5 border-border/30">
                  {["All", "Registration Open", "Ongoing", "Completed"].map((filter, i) => (
                    <button key={i} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
                      {filter}
                    </button>
                  ))}
                </div>

                <button className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-foreground text-background shadow-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                  <Filter size={16} />
                  Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.length > 0 ? tournaments.map((event: any, idx: number) => (
                <Link
                  key={idx}
                  href={`/tournaments/${event.id}`}
                  className="group relative rounded-[2.5rem] border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all duration-700 block shimmer-glint"
                >
                  {/* Status Overlay */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-2 glass border shadow-lg ${event.status === 'Open' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' :
                      event.status === 'Ongoing' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                        'border-white/20 bg-white/5 text-slate-300'
                      }`}>
                      {event.status === 'Open' && <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>}
                      <span>{event.status}</span>
                    </div>
                  </div>

                  {/* Game Category Icon Indicator */}
                  <div className="absolute top-6 right-6 z-20">
                    <div className="w-10 h-10 rounded-xl glass border border-white/20 flex items-center justify-center text-white shadow-xl">
                      <Gamepad2 size={20} className={config.accent} />
                    </div>
                  </div>

                  <div className="aspect-[16/10] w-full bg-muted overflow-hidden relative">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                      <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl border border-white/20 text-white shadow-xl">
                        <UsersIcon size={16} className={config.accent} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.format}</span>
                      </div>
                      <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl border border-white/20 text-white shadow-xl">
                        <Calendar size={16} className={config.accent} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{event.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${config.accent}`}>
                        {event.game}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-500/30" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                        {category}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight group-hover:text-accent-blue transition-all duration-500">
                      {event.name}
                    </h3>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-60">Grand Prize</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter">{event.prize}</p>
                      </div>

                      <div className={`h-14 w-14 flex items-center justify-center rounded-2xl bg-foreground text-background group-hover:bg-gradient-to-br ${config.gradient} group-hover:text-white transition-all duration-500 shadow-xl group-hover:rotate-[360deg]`}>
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full py-32 text-center rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/10 backdrop-blur-sm">
                  <Trophy className="mx-auto h-20 w-20 text-muted-foreground/20 mb-8 animate-bounce" />
                  <h3 className="text-2xl font-black text-foreground mb-4 italic uppercase">Arena Empty</h3>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">No elite tournaments are currently scheduled for this category. Check back soon for the next global event.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Decorative background element */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 -rotate-90 text-[15rem] font-black text-foreground/[0.01] pointer-events-none select-none tracking-tighter mix-blend-overlay uppercase">
        {category}
      </div>
    </div>
  );
}
