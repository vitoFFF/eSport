import React from "react";
import { createClient } from "@/utils/supabase/server";
import { User, Trophy, Gamepad2, Medal, ChevronLeft, MapPin, Calendar, Activity } from "lucide-react";
import Link from "next/link";

export default async function PlayerProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);

  // Fetch Profile by username (case-insensitive)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .single();

  if (!profile) {
    return <div className="p-20 text-center text-foreground font-bold">Player not found</div>;
  }

  // Fetch Player's Teams
  const { data: memberData } = await supabase
    .from("team_members")
    .select(`
      *,
      teams (
        id,
        name,
        category,
        avatar_url,
        organizations (name)
      )
    `)
    .eq("user_id", profile.id)
    .eq("status", "joined");

  // Fetch Player's Tournament Registrations (Individual)
  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select(`
      *,
      tournaments (*)
    `)
    .eq("player_id", profile.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Immersive Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent-blue/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-accent-purple/10 blur-[80px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl">
          <Link href="/tournaments" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
             <div className="p-2 rounded-xl bg-muted/50 border border-border group-hover:bg-muted transition-colors">
               <ChevronLeft size={16} />
             </div>
             <span className="text-xs font-black uppercase tracking-widest">Back to Arena</span>
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-accent-blue via-accent-purple to-pink-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000" />
              <div className="relative h-40 w-40 md:h-52 md:w-52 rounded-[2.2rem] bg-card border-2 border-border/50 overflow-hidden shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <User size={80} className="text-white/10" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 p-4 rounded-2xl bg-foreground text-background shadow-2xl">
                <Medal size={24} />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 rounded-full bg-foreground text-background text-[10px] font-black uppercase tracking-widest">
                  {profile.role}
                </span>
                {profile.role === 'manager' && (
                   <span className="px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[10px] font-black uppercase tracking-widest">
                    Verified Manager
                   </span>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight uppercase leading-tight">
                {profile.full_name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground font-bold italic">
                <span className="text-accent-blue">@{profile.username}</span>
                <span className="flex items-center gap-2"><MapPin size={16} /> Global Elite</span>
                <span className="flex items-center gap-2"><Calendar size={16} /> Joined {new Date(profile.updated_at).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Bio and Stats */}
          <div className="lg:col-span-8 space-y-12">
            {/* Bio Card */}
            <div className="p-10 rounded-[3rem] bg-card/40 backdrop-blur-md border border-border/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity size={100} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-blue mb-6">Personal Biography</h3>
              <p className="text-xl text-muted-foreground leading-relaxed italic">
                "{profile.bio || "This competitor preferred to keep their strategy secret. No bio provided."}"
              </p>
            </div>

            {/* Favorite Games Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Gamepad2 className="text-accent-purple" />
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Main Disciplines</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.games && profile.games.length > 0 ? (
                  profile.games.map((game: string) => (
                    <div key={game} className="p-6 rounded-3xl bg-muted/30 border border-border/60 hover:border-accent-purple/40 transition-all flex flex-col items-center gap-3 group text-center">
                       <div className="h-12 w-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Gamepad2 size={24} className="text-accent-purple" />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-foreground">{game}</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground font-medium italic">No specific games listed.</p>
                )}
              </div>
            </div>

            {/* Active Teams */}
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                <Trophy className="text-emerald-500" />
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Contracted Teams</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberData && memberData.length > 0 ? (
                  memberData.map((m: any) => (
                    <Link key={m.teams.id} href={`/teams/${m.teams.id}`} className="group p-6 rounded-3xl bg-card border border-border/60 hover:border-emerald-500/40 transition-all flex items-center gap-5 shadow-sm">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                        {m.teams.avatar_url ? (
                          <img src={m.teams.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <Trophy size={24} className="text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-black text-foreground group-hover:text-emerald-500 transition-colors">{m.teams.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.teams.category} • {m.teams.organizations?.name}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground font-medium italic">Currently an independent agent.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Performance Metrics */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 space-y-8">
                <div className="p-10 rounded-[3.5rem] bg-foreground text-background shadow-2xl relative overflow-hidden group">
                  {/* Glowing accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-10">Legacy Stats</h3>
                  
                  <div className="space-y-10">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Global Standing</p>
                      <p className="text-5xl font-black tracking-tighter">UNRANKED</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Win Streak</p>
                         <p className="text-3xl font-black">0</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Titles</p>
                         <p className="text-3xl font-black">0</p>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-background/10">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Career Completion</span>
                         <span className="text-sm font-black">0%</span>
                       </div>
                       <div className="h-2 w-full bg-background/20 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-blue w-0" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Legacy Card Preview CTA */}
                <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Medal size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">This player has not yet minted their Global Legacy Card.</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
