import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Trophy, Users, Calendar, ShieldAlert, GitBranch, LayoutGrid, Target, Shield, RefreshCw } from "lucide-react";
import { registerForTournament, cancelRegistration } from "@/actions/profile";
import { revalidatePath } from "next/cache";
import Link from 'next/link';
import RegistrationForm from "@/components/tournament/RegistrationForm";
import CancelRegistrationForm from "@/components/tournament/CancelRegistrationForm";
import BracketView from "@/components/tournament/BracketView";
import ManualSeeding from "@/components/tournament/ManualSeeding";

export default async function TournamentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user 
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const resolvedParams = await params;
  const tournamentId = resolvedParams.id;

  // Fetch Tournament
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    return <div className="p-20 text-center">Tournament not found</div>;
  }

  // Fetch User's Teams that match this tournament's category
  let eligibleTeams = [];
  let isRegistered = false;

  if (user) {
    const { data: memberData } = await supabase
      .from("team_members")
      .select(`
        *,
        teams (
          id,
          name,
          category
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "joined");

    if (memberData) {
      eligibleTeams = memberData
        .filter((m: any) => m.teams?.category === tournament.category)
        .map((m: any) => m.teams);
    }

    // Check if user or their teams are already registered
    const { data: reg } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        teams (
          organization_id,
          organizations (owner_id)
        )
      `)
      .eq("tournament_id", tournament.id)
      .or(`player_id.eq.${user.id},team_id.in.(${eligibleTeams.map((t: any) => t.id).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    
    if (reg && reg.length > 0) {
      isRegistered = true;
      const teamReg = reg.find(r => r.team_id);
      if (teamReg) {
        (tournament as any).registeredTeamId = teamReg.team_id;
        // Check if user is the owner of the organization
        const ownerId = teamReg.teams?.organizations?.owner_id;
        (tournament as any).isManager = ownerId === user.id;
      } else {
        // It's a player registration
        (tournament as any).isOwnRegistration = reg.some(r => r.player_id === user.id);
      }
    }
  }

  // Fetch current registrations
  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select(`
      *,
      profiles:player_id (username, full_name),
      teams:team_id (name, avatar_url)
    `)
    .eq("tournament_id", tournament.id);

  // Fetch matches for bracket
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:home_team_id (name, avatar_url),
      away_team:away_team_id (name, avatar_url),
      home_player:home_player_id (username, full_name, avatar_url),
      away_player:away_player_id (username, full_name, avatar_url)
    `)
    .eq("tournament_id", tournament.id)
    .order('bracket_round', { ascending: true })
    .order('match_order', { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full h-[400px] relative bg-muted">
        {tournament.banner_url ? (
          <img src={tournament.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
             <Trophy className="text-slate-700 h-24 w-24" />
          </div>
        )}
        
        <div className="absolute top-32 left-6 z-20">
          <Link href="/tournaments" className="flex items-center space-x-2 text-white hover:text-accent-blue transition-colors group">
            <div className="p-2 glass rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
              <span className="font-bold">&larr;</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-shadow">Back to Arena</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-[90rem] -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-md bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-accent-blue/20">
                {tournament.category} • {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' ? 'Team Mode' : '1v1 Mode'}
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight text-shadow-sm">{tournament.name}</h1>
              <p className="text-white/70 mt-6 text-lg max-w-2xl">{tournament.description || "No official description provided for this event."}</p>
            </div>

            {/* Tournament Format Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-6 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3 hover:border-accent-blue/30 transition-all group">
                  <div className="p-3 rounded-2xl bg-accent-blue/10 text-accent-blue group-hover:scale-110 transition-transform">
                     <GitBranch size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Bracket Type</p>
                    <p className="text-sm font-black uppercase text-foreground">
                       {tournament.bracket_structure?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Standard'}
                    </p>
                  </div>
               </div>

               <div className="p-6 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3 hover:border-accent-purple/30 transition-all group">
                  <div className="p-3 rounded-2xl bg-accent-purple/10 text-accent-purple group-hover:scale-110 transition-transform">
                     <Users size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Entry Mode</p>
                    <p className="text-sm font-black uppercase text-foreground">
                       {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' ? 'Team vs Team' : 'Individual 1v1'}
                    </p>
                  </div>
               </div>

               <div className="p-6 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3 hover:border-emerald-500/30 transition-all group">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                     <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Roster Size</p>
                    <p className="text-sm font-black uppercase text-foreground">
                       {tournament.max_roster_size} Players
                    </p>
                  </div>
               </div>

               <div className="p-6 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3 hover:border-amber-500/30 transition-all group">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                     <Target size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Stage Start</p>
                    <p className="text-sm font-black uppercase text-foreground">
                       {tournament.settings?.stage_participants_count || 8} Participants
                    </p>
                  </div>
               </div>
            </div>

            {/* Confirmed Competitors / Seeding Section */}
            {user?.id === tournament.organizer_id && (matches || []).length === 0 ? (
               <ManualSeeding registrations={registrations || []} tournamentId={tournament.id} />
            ) : (
              <div className="p-10 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
                  <Users size={20} className="text-accent-purple" /> Confirmed Competitors
                </h3>
                {registrations && registrations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registrations.map((reg: any) => (
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
                             {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' 
                               ? reg.teams?.name 
                               : (reg.profiles?.username || reg.profiles?.full_name || 'Unknown Player')}
                           </p>
                           <p className="text-[11px] uppercase font-black text-emerald-500 tracking-widest mt-1.5 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Confirmed Entry
                           </p>
                         </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center rounded-[2rem] border border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/10">
                     <Users className="text-muted-foreground/20 mb-4 h-16 w-16" />
                     <p className="text-muted-foreground font-bold italic text-lg text-shadow-sm">The arena is empty. Be the first to register.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-32 space-y-6">
              <div className="p-8 rounded-[2rem] border border-border bg-gradient-to-b from-card to-muted/30 shadow-2xl">
                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Prize Pool</p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple">
                      {tournament.prize_pool || "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold bg-background p-4 rounded-xl border border-border">
                    <Calendar size={18} className="text-emerald-500" />
                    Open for Registration
                  </div>
                </div>

                {!user ? (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                    <ShieldAlert className="mx-auto text-amber-500" size={32} />
                    <p className="text-sm font-bold text-amber-500">Sign in to Register</p>
                    <Link href="/auth">
                       <button className="w-full mt-2 py-3 rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest text-xs">
                         Go to Login
                       </button>
                    </Link>
                  </div>
                ) : profile?.role === 'organizer' ? (
                  <div className="p-6 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-center space-y-2">
                     <Trophy className="mx-auto text-accent-blue opacity-50 mb-1" size={24} />
                     <p className="text-sm font-black text-accent-blue uppercase tracking-widest">Organizer Mode</p>
                     <p className="text-[11px] text-muted-foreground font-bold leading-relaxed px-2">
                       As an organizer, you are here to manage the competition, not to participate in it.
                     </p>
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-4">
                    <div className="w-full py-5 rounded-2xl bg-emerald-500/10 text-emerald-500 font-black text-center uppercase tracking-widest border border-emerald-500/20 flex flex-col items-center">
                      <span className="text-2xl mb-1">✓</span>
                      Registration Confirmed
                    </div>
                    
                    {((tournament as any).isOwnRegistration || (tournament as any).isManager) && (
                      <CancelRegistrationForm 
                        tournamentId={tournament.id} 
                        teamId={(tournament as any).registeredTeamId}
                      />
                    )}
                  </div>
                ) : (
                  <RegistrationForm 
                    tournament={tournament} 
                    eligibleTeams={eligibleTeams} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Bracket Arena */}
        <div className="space-y-8 my-20">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-6">
                <Trophy size={20} className="text-accent-blue" /> Tournament Bracket Arena
            </h3>
            <div className="p-10 rounded-[3rem] border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 opacity-30" />
                <div className="relative z-10">
                    <BracketView 
                        matches={matches || []} 
                        registrations={registrations || []}
                        totalParticipants={tournament.settings?.stage_participants_count || 8}
                        isOrganizer={user?.id === tournament.organizer_id}
                        tournamentId={tournament.id}
                        bracketStructure={tournament.bracket_structure}
                        matchFormat={tournament.settings?.match_format || 'bo1'}
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
