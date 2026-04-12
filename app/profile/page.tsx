import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PlayerProfile from "@/components/profile/PlayerProfile";
import OrganizationManager from "@/components/profile/OrganizationManager";
import TournamentRegistrationManager from "@/components/profile/TournamentRegistrationManager";
import OrganizerDashboard from "@/components/tournaments/OrganizerDashboard";
import { signOut } from "@/actions/auth";
import { LogOut, LayoutDashboard, User, Trophy } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({ searchParams }: { searchParams: { tab?: string } }) {
  const { tab = 'overview' } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found. Please contact support.</div>;
  }

  let organization = null;
  let teams = [];
  let tournaments = [];
  let playerTeams = [];
  let teamInvites = [];

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

  if (profile.role === "manager") {
    // Organizations and Teams
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

  if (profile.role === "organizer") {
    const { data: tournamentData } = await supabase
      .from("tournaments")
      .select("*")
      .eq("organizer_id", user.id);
    
    tournaments = tournamentData || [];
  }

  let allTournaments = [];
  if (tab === 'arena' && profile.role === 'manager') {
    const { data: allTournamentsData } = await supabase
      .from("tournaments")
      .select("*")
      .order('created_at', { ascending: false });
    allTournaments = allTournamentsData || [];
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Profile Header */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent-blue/5 to-transparent pointer-none -z-10" />
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border flex items-center justify-center shadow-2xl relative group overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
                  </div>
               </div>
               <div>
                 <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-4xl font-black tracking-tight">{profile.full_name}</h1>
                   <span className="px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-black uppercase tracking-widest">
                     {profile.role}
                   </span>
                 </div>
                 <p className="text-muted-foreground font-semibold">@{profile.username}</p>
               </div>
            </div>

            <form action={signOut}>
               <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted border border-border text-xs font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                 <LogOut size={16} />
                 Sign Out
               </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="container mx-auto px-6 max-w-7xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-2">
                 <Link href="/profile?tab=overview">
                   <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={tab === 'overview'} />
                 </Link>
                 <Link href="/profile?tab=personal">
                   <NavItem icon={<User size={18} />} label="Personal Profile" active={tab === 'personal'} />
                 </Link>
                 
                 {profile.role === 'manager' && (
                   <Link href="/profile?tab=arena">
                     <NavItem icon={<Trophy size={18} />} label="Tournament Arena" active={tab === 'arena'} />
                   </Link>
                 )}
                <div className="pt-4 mt-4 border-t border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 mb-2">Account Type: {profile.role}</p>
                </div>
             </div>
          </div>

          {/* Role-Specific Content */}
          <div className="lg:col-span-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {tab === 'overview' && (
               <>
                 {profile.role === "player" && <PlayerProfile profile={profile} playerTeams={playerTeams} teamInvites={teamInvites} />}
                 {profile.role === "manager" && <OrganizationManager profile={profile} organization={organization} teams={teams} />}
                 {profile.role === "organizer" && <OrganizerDashboard profile={profile} tournaments={tournaments} />}
               </>
             )}
             
             {tab === 'arena' && profile.role === 'manager' && (
               <div className="space-y-8">
                 <div className="p-8 rounded-[2rem] border border-border bg-card/50">
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                      <Trophy className="text-accent-blue" /> Tournament Arena
                    </h2>
                    <p className="text-muted-foreground mb-8">Discover upcoming events and register your teams to compete for glory.</p>
                    
                    <TournamentRegistrationManager tournaments={allTournaments} teams={teams} />
                 </div>
               </div>
             )}
             
             {tab === 'personal' && (
               <div className="p-12 rounded-[3rem] border border-border bg-card/50 text-center">
                 <h2 className="text-3xl font-black mb-4">Personal Settings</h2>
                 <p className="text-muted-foreground">This section is currently under construction. Please check back later.</p>
               </div>
             )}
             {profile.role === "admin" && (
                <div className="p-12 rounded-[3rem] border border-border bg-card/50 text-center">
                  <h2 className="text-3xl font-black mb-4">Master Admin Console</h2>
                  <p className="text-muted-foreground mb-8">Complete platform control enabled. Monitor all users, teams, and tournaments.</p>
                  <div className="grid grid-cols-3 gap-4">
                     {['Users', 'Teams', 'Events'].map(stat => (
                       <div key={stat} className="p-6 rounded-2xl bg-muted border border-border">
                         <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{stat}</p>
                         <p className="text-2xl font-black">All Access</p>
                       </div>
                     ))}
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-foreground text-background shadow-lg shadow-black/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}>
      {icon}
      {label}
    </button>
  );
}
