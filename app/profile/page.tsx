import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PlayerProfile from "@/components/profile/PlayerProfile";
import OrganizationManager from "@/components/profile/OrganizationManager";
import TournamentRegistrationManager from "@/components/profile/TournamentRegistrationManager";
import OrganizerDashboard from "@/components/tournaments/OrganizerDashboard";
import DashboardShell from "@/components/profile/DashboardContentWrapper";
import { Trophy, User, LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";

import PersonaUpdateForm from "@/components/profile/PersonaUpdateForm";
import SettingsView from "@/components/profile/SettingsView";

export default async function ProfilePage({ searchParams }: { searchParams: { tab?: string } }) {
  const { tab = 'overview' } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const meta = user.user_metadata;
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: meta?.full_name || user.email?.split('@')[0] || "New User",
        username: meta?.username || `user_${user.id.slice(0, 5)}`,
        role: meta?.role || 'player',
      })
      .select()
      .single();

    if (createError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="text-center p-8 rounded-[2rem] border border-border bg-card shadow-2xl max-w-md">
            <h2 className="text-2xl font-black text-red-500 mb-4 uppercase tracking-tight">Access Restricted</h2>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              We couldn't automatically recover your profile after the database reset.
            </p>
          </div>
        </div>
      );
    }
    profile = newProfile;
  }

  let organization = null;
  let teams: any[] = [];
  let playerTeams: any[] = [];
  let teamInvites: any[] = [];

  if (profile.role === "player") {
    const { data: memberData } = await supabase
      .from('team_members')
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
      .eq('user_id', user.id);
      
    if (memberData) {
       playerTeams = memberData.filter(m => m.status === 'joined').map(m => ({ ...m.teams, team_id: m.teams.id }));
       teamInvites = memberData.filter(m => m.status === 'pending').map(m => ({ ...m.teams, team_id: m.teams.id }));
    }
  }

  // Fetch real player stats for dashboard
  const { count: matchesPlayed } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .or(`home_player_id.eq.${user.id},away_player_id.eq.${user.id}`);

  const { count: wins } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("winner_player_id", user.id);

  const playerStats = {
    matchesPlayed: matchesPlayed || 0,
    wins: wins || 0,
    mvpAwards: profile.mvp_awards || 0
  };

  if (profile.role === "manager") {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();
    
    organization = orgData;

    if (organization) {
      const { data: teamsData } = await supabase
        .from("teams")
        .select(`
          *,
          team_members (
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq("organization_id", organization.id);
      
      teams = teamsData || [];
    }
  }

  let organizerTournaments: any[] = [];
  if (profile.role === "organizer") {
    const { data: tournamentData } = await supabase
      .from("tournaments")
      .select("*")
      .eq("organizer_id", user.id)
      .order('created_at', { ascending: false });
    organizerTournaments = tournamentData || [];
  }

  // Always fetch tournaments so sport-specific views can display them
  const { data: allTournamentsData } = await supabase
    .from("tournaments")
    .select("*")
    .order('created_at', { ascending: false });
  const allTournaments = allTournamentsData || [];

  const headerRight = (
    <div className="flex items-center gap-6">
       <div className="hidden md:flex flex-col items-end">
         <p className="text-sm font-black tracking-tight">{profile.full_name}</p>
         <p className="text-[10px] font-bold text-[var(--sport-accent,var(--accent-blue))] uppercase tracking-widest transition-colors duration-500">{profile.role}</p>
       </div>
       
       {/* Synced Circular Avatar with Status */}
       <div className="relative group">
         <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center text-white shadow-lg shadow-accent-blue/20 transition-all group-hover:scale-105 overflow-hidden">
           {profile.avatar_url ? (
             <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
           ) : (
             <User size={24} />
           )}
         </div>
         {/* Online status dot */}
         <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#f8fafc] dark:border-background status-online" />
       </div>

       <div className="h-8 w-px bg-border/50 mx-2 hidden md:block" />

       {/* Integrated Sign Out */}
       <form action={signOut}>
         <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-red-500/10 transition-all hover:translate-y-[-1px]">
           <LogOut size={16} />
           Sign Out
         </button>
       </form>
    </div>
  );

  return (
    <DashboardShell profile={profile} headerRight={headerRight} tournaments={allTournaments} teams={teams} currentTab={tab}>
      {tab === 'overview' && (
        <>
          {profile.role === "player" && <PlayerProfile profile={profile} playerTeams={playerTeams} teamInvites={teamInvites} stats={playerStats} />}
          {profile.role === "manager" && <OrganizationManager profile={profile} organization={organization} teams={teams} />}
          {profile.role === "organizer" && <OrganizerDashboard profile={profile} tournaments={organizerTournaments} />}
        </>
      )}
      
      {tab === 'arena' && profile.role === 'manager' && (
        <div className="space-y-8">
          <div className="p-10 dash-card">
             <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
               <Trophy className="text-accent-blue" size={28} /> Tournament Arena
             </h2>
             <p className="text-muted-foreground mb-10 font-medium">Discover upcoming events and register your teams to compete for glory.</p>
             
             <TournamentRegistrationManager tournaments={allTournaments} teams={teams} />
          </div>
        </div>
      )}
      
      {tab === 'personal' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PersonaUpdateForm profile={profile} />
        </div>
      )}
      
      {tab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SettingsView />
        </div>
      )}
    </DashboardShell>
  );
}
