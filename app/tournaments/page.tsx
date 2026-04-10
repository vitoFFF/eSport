import React from "react";
import Link from "next/link";
import { Trophy, Calendar, Users, Filter, ChevronRight, PlayCircle } from "lucide-react";

export default async function TournamentsCategoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // In Next 13-14 searchParams is synchronous, in 15 it's a promise, we handle both safely.
  const resolvedParams = await searchParams;
  const rawCategory = (resolvedParams?.category as string) || "all";
  const category = rawCategory.toLowerCase();

  // Dynamic Theme Configuration
  const categoryConfig: Record<string, any> = {
    football: {
      title: "SHATTER THE PITCH",
      subtitle: "Elite 11v11 and 5v5 global football tournaments. Assemble your squad and dominate the season.",
      gradient: "from-emerald-400 to-green-600",
      pillBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      mockImage: "https://images.unsplash.com/photo-1518605368461-1ee12db80fa5?auto=format&fit=crop&q=80&w=1200",
      events: [
        { name: "Pro League Spring Split", format: "11v11", prize: "$10,000", date: "April 15", status: "Open" },
        { name: "Weekend Masters 5v5", format: "5v5", prize: "$2,500", date: "April 22", status: "Filling" },
        { name: "Continental Champions", format: "11v11", prize: "$50,000", date: "May 01", status: "Upcoming" },
      ]
    },
    tennis: {
      title: "OWN THE COURT",
      subtitle: "Compete in official singles and doubles racket-sports championships locally and globally.",
      gradient: "from-yellow-400 to-amber-600",
      pillBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      mockImage: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=1200",
      events: [
        { name: "World Tennis Open", format: "Singles", prize: "$15,000", date: "May 10", status: "Open" },
        { name: "Summer Doubles Clash", format: "Doubles", prize: "$5,000", date: "May 18", status: "Filling" },
      ]
    },
    padel: {
      title: "THE PADEL REVOLUTION",
      subtitle: "Fast-paced, high-stakes Padel tournaments. Join the fastest growing sport circuit in the world.",
      gradient: "from-sky-400 to-blue-600",
      pillBg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
      mockImage: "https://images.unsplash.com/photo-1629824699564-8848f6834015?auto=format&fit=crop&q=80&w=1200",
      events: [
        { name: "Premier Padel Major", format: "Doubles", prize: "$25,000", date: "June 05", status: "Upcoming" },
        { name: "Local Masters Circuit", format: "Doubles", prize: "$3,000", date: "June 12", status: "Open" },
        { name: "Sunset Showdown", format: "Mixed", prize: "$1,500", date: "June 20", status: "Filling" },
      ]
    },
    esport: {
      title: "DIGITAL DOMINANCE",
      subtitle: "The ultimate competitive gaming platform. Valorant, League of Legends, CS:GO, and more.",
      gradient: "from-accent-blue to-accent-purple",
      pillBg: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
      mockImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
      events: [
        { name: "Valorant Radiant Cup", format: "5v5", prize: "$100,000", date: "July 01", status: "Upcoming" },
        { name: "CS:GO Winter Major", format: "5v5", prize: "$500,000", date: "August 15", status: "Upcoming" },
        { name: "Rocket League 3v3 Heat", format: "3v3", prize: "$20,000", date: "August 22", status: "Open" },
      ]
    },
    all: {
      title: "BROWSE ALL TOURNAMENTS",
      subtitle: "Explore global events across traditional sports and eSports. Filter by category, region, and prize pool.",
      gradient: "from-slate-400 to-slate-600",
      pillBg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      mockImage: "https://images.unsplash.com/photo-1461896836934-ffe607fa8211?auto=format&fit=crop&q=80&w=1200",
      events: [
        { name: "Valorant Radiant Cup", format: "5v5", prize: "$100,000", date: "July 01", status: "Upcoming" },
        { name: "Pro League Spring Split", format: "11v11", prize: "$10,000", date: "April 15", status: "Open" },
        { name: "Premier Padel Major", format: "Doubles", prize: "$25,000", date: "June 05", status: "Upcoming" },
      ]
    }
  };

  const config = categoryConfig[category] || categoryConfig["all"];

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Hero Section */}
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

      {/* Main Content & Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Filtering Toolbar */}
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

          {/* Tournament Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.events.map((event: any, idx: number) => (
              <div key={idx} className="group relative rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:border-border transition-all duration-500">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    event.status === 'Open' ? 'bg-emerald-500 text-white' :
                    event.status === 'Filling' ? 'bg-amber-500 text-white' :
                    'bg-slate-800 text-slate-100 dark:bg-slate-100 dark:text-slate-800'
                  }`}>
                    {event.status}
                  </span>
                </div>

                {/* Card Image Area */}
                <div className="aspect-[4/3] w-full bg-muted overflow-hidden relative">
                  <img src={config.mockImage} alt={event.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  
                  {/* Quick Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl border border-white/10 text-white">
                      <Users size={14} />
                      <span className="text-xs font-bold">{event.format}</span>
                    </div>
                    <div className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl border border-white/10 text-white">
                      <Calendar size={14} />
                      <span className="text-xs font-bold">{event.date}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-accent-blue transition-colors line-clamp-1">
                    {event.name}
                  </h3>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Prize Pool</p>
                      <p className="text-lg font-black text-foreground">{event.prize}</p>
                    </div>
                    
                    <Link href={`/tournaments/mock-id-${idx}`} className={`h-10 w-10 flex items-center justify-center rounded-full bg-foreground text-background group-hover:-rotate-45 transition-transform duration-300`}>
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>
    </div>
  );
}
