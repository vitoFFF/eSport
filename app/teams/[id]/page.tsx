import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Users, Trophy, Shield, ChevronLeft, Target } from "lucide-react";
import Link from "next/link";

export default async function TeamDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const teamId = resolvedParams.id;

  // Fetch Team details with organization info
  const { data: team } = await supabase
    .from("teams")
    .select(`
      *,
      organizations (
        name,
        owner_id
      )
    `)
    .eq("id", teamId)
    .single();

  if (!team) {
    return <div className="p-20 text-center text-foreground">Team not found</div>;
  }

  // Fetch Team Members
  const { data: members } = await supabase
    .from("team_members")
    .select(`
      *,
      profiles:user_id (
        username,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("team_id", teamId)
    .eq("status", "joined");

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Header with glassmorphism */}
      <div className="relative pt-32 pb-20 overflow-hidden border-b border-border/50">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-accent-blue/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] bg-accent-purple/10 blur-[100px] rounded-full" />
        
        <div className="container mx-auto px-6 max-w-7xl">
          <Link href="/tournaments" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
             <div className="p-2 rounded-xl bg-muted/50 border border-border group-hover:bg-muted transition-colors">
               <ChevronLeft size={16} />
             </div>
             <span className="text-xs font-black uppercase tracking-widest">Back to Arena</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-accent-purple rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
               <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-[2.2rem] overflow-hidden bg-card border-2 border-border/50 shadow-2xl">
                 {team.avatar_url ? (
                   <img src={team.avatar_url} alt={team.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                     <Shield size={64} className="text-white/10" />
                   </div>
                 )}
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 rounded-full bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-blue/20">
                  {team.category} CATEGORY
                </span>
                <span className="px-4 py-1.5 rounded-full bg-muted/80 border border-border/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  EST. {new Date(team.created_at).getFullYear()}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight uppercase leading-none">
                {team.name}
              </h1>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 w-fit backdrop-blur-sm">
                <div className="h-8 w-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                  <Trophy size={16} className="text-accent-purple" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  Representing <span className="text-foreground">{team.organizations?.name}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="container mx-auto px-6 max-w-7xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Roster (Main Content) */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground uppercase tracking-tight italic">Active Roster</h2>
                  <div className="h-1.5 w-12 bg-accent-blue rounded-full mt-2" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                  <Users size={16} className="text-accent-blue" />
                  <span className="text-sm font-black text-foreground">{members?.length || 0} COMPETITORS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members && members.length > 0 ? (
                  members.map((member: any) => {
                    const profile = member.profiles;
                    const username = profile?.username;
                    
                    if (!username) {
                      return (
                        <div key={member.id} className="relative p-6 rounded-3xl bg-card/40 backdrop-blur-sm border border-border/60 flex items-center gap-5">
                          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                            <Users size={24} className="text-muted-foreground/30" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-foreground">Anonymous Player</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status: Active</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link href={`/players/${username}`} key={member.id} className="group relative block">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue to-accent-purple opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity" />
                      <div className="relative p-6 rounded-3xl bg-card/40 backdrop-blur-sm border border-border/60 hover:border-accent-blue/40 transition-all flex items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted border-2 border-background shadow-inner">
                          {member.profiles?.avatar_url ? (
                            <img src={member.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-700 to-slate-800">
                              <span className="text-white/30 text-xl font-black">
                                {(member.profiles?.username || "P").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="text-lg font-black text-foreground group-hover:text-accent-blue transition-colors">
                            {member.profiles?.username || member.profiles?.full_name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              member.profiles?.role === 'manager' ? 'bg-accent-purple/10 text-accent-purple' : 'bg-accent-blue/10 text-accent-blue'
                            }`}>
                              {member.profiles?.role || "Player"}
                            </span>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronLeft size={16} className="rotate-180" />
                        </div>
                      </div>
                    </Link>
                  );
                })
                ) : (
                  <div className="col-span-full py-20 text-center rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/10">
                    <Users size={64} className="mx-auto text-muted-foreground/10 mb-6" />
                    <p className="text-xl font-bold text-muted-foreground italic">The roster is currently being assembled.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-10 rounded-[3rem] bg-card border border-border/60 shadow-2xl relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Trophy size={120} />
               </div>

               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-blue mb-10 pb-4 border-b border-border/50">Performance metrics</h3>
               
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Rank</p>
                     <p className="text-3xl font-black text-foreground tracking-tighter">#--</p>
                   </div>
                   <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                     <Target size={24} className="text-muted-foreground" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1 p-5 rounded-2xl bg-muted/30 border border-border/50">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Wins</p>
                     <p className="text-2xl font-black text-foreground tracking-tighter">0</p>
                   </div>
                   <div className="space-y-1 p-5 rounded-2xl bg-muted/30 border border-border/50">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Losses</p>
                     <p className="text-2xl font-black text-foreground tracking-tighter">0</p>
                   </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Win Ratio</span>
                     <span className="text-3xl font-black text-emerald-500 tracking-tighter">0%</span>
                   </div>
                   <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden">
                     <div className="w-0 h-full bg-emerald-500" />
                   </div>
                 </div>
               </div>
            </div>

            {/* Recent Activity Mini-Card */}
            <div className="p-8 rounded-[2.5rem] border border-border/50 bg-muted/20">
               <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Status</h4>
               <p className="text-sm font-medium text-foreground italic opacity-60">"Preparing for upcoming qualifiers. Practice starts Monday."</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
