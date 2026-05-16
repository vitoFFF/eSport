import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Trophy, Users, Calendar, ShieldAlert, GitBranch, LayoutGrid, Target, Shield, RefreshCw, Timer, Flag, Zap, ArrowRight } from "lucide-react";
import { registerForTournament, cancelRegistration } from "@/actions/profile";
import { revalidatePath } from "next/cache";
import Link from 'next/link';
import RegistrationForm from "@/components/tournament/RegistrationForm";
import CancelRegistrationForm from "@/components/tournament/CancelRegistrationForm";
import BracketView from "@/components/tournament/BracketView";
import ManualSeeding from "@/components/tournament/ManualSeeding";

import CompetitorsList from "@/components/tournament/CompetitorsList";
import RulesDescriptionView from "@/components/tournament/RulesDescriptionView";
import TournamentHero from "@/components/tournament/TournamentHero";

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
      <TournamentHero tournament={tournament} />

      <div className="w-full px-4 md:px-12 max-w-[1600px] mx-auto mt-12 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">

            {/* Tournament Format Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'Bracket Type', value: tournament.bracket_structure?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Standard', icon: GitBranch, color: 'accent-blue' },
                 { label: 'Match Format', value: tournament.match_format?.toUpperCase() || 'BO1', icon: Target, color: 'accent-purple' },
                 { label: 'Participation', value: tournament.participation_mode === 'team' ? `${tournament.team_size}v${tournament.team_size}` : '1v1', icon: Users, color: 'emerald-500' },
                 { label: 'Location', value: tournament.location_type === 'online' ? 'Online' : 'LAN', icon: LayoutGrid, color: 'amber-500' }
               ].map((item, i) => (
                 <div key={i} className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-accent-blue/30 transition-all duration-500 group flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl bg-${item.color}/10 text-${item.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                       <item.icon size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-60">{item.label}</p>
                      <p className="text-sm font-black uppercase text-foreground tracking-tight">
                         {item.value}
                      </p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Confirmed Competitors / Seeding Section */}
            {user?.id === tournament.organizer_id && (matches || []).length === 0 ? (
               <ManualSeeding registrations={registrations || []} tournamentId={tournament.id} />
            ) : (
              <div className="p-10 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
                  <Users size={20} className="text-accent-purple" /> Confirmed Competitors
                </h3>
                <CompetitorsList 
                  registrations={registrations || []} 
                  participationMode={tournament.participation_mode} 
                />
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-40 space-y-6">
              <div className="p-8 rounded-[2rem] border border-border bg-gradient-to-b from-card to-muted/30 shadow-2xl space-y-8">
                <div className="space-y-6">
                  <div className="relative group overflow-hidden p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Prize Pool</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-[length:200%_auto] animate-shimmer">
                      {tournament.prize_pool ? tournament.prize_pool.replace(/\s?\$\s?$/, '').replace(/^\$/, '$') : "$0"}
                    </p>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Trophy size={64} className="text-accent-blue" />
                    </div>
                  </div>
                </div>

                {/* Schedule & Deadlines */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-6 flex items-center gap-2">
                      <Calendar size={12} className="text-accent-blue" /> Event Timeline
                   </h4>
                   
                   <div className="space-y-4">
                      {[
                        { label: 'Reg. Starts', date: tournament.registration_start_date, icon: Flag },
                        { label: 'Reg. Ends', date: tournament.registration_end_date, icon: Shield },
                        { label: 'Kick-off', date: tournament.start_date, icon: Zap, highlight: true },
                        { label: 'Tournament Ends', date: tournament.end_date, icon: Trophy }
                      ].map((step, idx) => (
                        <div key={idx} className={`flex items-center justify-between group/item ${step.highlight ? 'py-3 px-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10' : ''}`}>
                           <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${step.highlight ? 'bg-accent-blue/10 text-accent-blue' : 'bg-muted text-muted-foreground group-hover/item:text-accent-purple group-hover/item:bg-accent-purple/5 transition-colors'}`}>
                                 <step.icon size={12} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${step.highlight ? 'text-accent-blue' : 'text-muted-foreground'}`}>{step.label}</span>
                           </div>
                           <span className={`text-[11px] font-black ${step.highlight ? 'text-accent-blue' : 'text-foreground'}`}>
                              {step.date ? new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                           </span>
                        </div>
                      ))}
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
                    <div className="w-full py-3.5 rounded-2xl bg-emerald-500/5 text-emerald-600 font-black text-[11px] text-center uppercase tracking-[0.2em] border border-emerald-500/10 flex items-center justify-center gap-2">
                      <span className="text-lg">✓</span>
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
