import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Trophy, Users, Calendar, ShieldAlert } from "lucide-react";
import { registerForTournament } from "@/actions/profile";
import { revalidatePath } from "next/cache";
import Link from 'next/link';

export default async function TournamentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      .select("*")
      .eq("tournament_id", tournament.id)
      .or(`player_id.eq.${user.id},team_id.in.(${eligibleTeams.map((t: any) => t.id).join(',') || '00000000-0000-0000-0000-000000000000'})`);
    
    if (reg && reg.length > 0) {
      isRegistered = true;
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
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute top-32 left-6 z-20">
          <Link href="/tournaments" className="flex items-center space-x-2 text-white hover:text-accent-blue transition-colors group">
            <div className="p-2 glass rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
              <span className="font-bold">&larr;</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-shadow">Back to Arena</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-md bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-accent-blue/20">
                {tournament.category} • {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' ? 'Team Mode' : '1v1 Mode'}
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tight text-shadow-sm">{tournament.name}</h1>
              <p className="text-muted-foreground mt-6 text-lg max-w-2xl">{tournament.description || "No official description provided for this event."}</p>
            </div>

            <div className="p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <Users size={18} /> Confirmed Competitors
              </h3>
              {registrations && registrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrations.map((reg: any) => (
                    <div key={reg.id} className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-4 hover:border-accent-blue/50 transition-colors">
                       <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                          {reg.teams?.avatar_url || reg.profiles?.avatar_url ? (
                             <img src={reg.teams?.avatar_url || reg.profiles?.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="text-white/50" size={20} />
                          )}
                       </div>
                       <div>
                         <p className="font-bold text-base leading-tight">
                           {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' 
                             ? reg.teams?.name 
                             : reg.profiles?.username}
                         </p>
                         <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mt-1">Confirmed Entry</p>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                   <Users className="text-muted-foreground/30 mb-2 h-12 w-12" />
                   <p className="text-muted-foreground font-bold italic">The arena is empty. Be the first to register.</p>
                </div>
              )}
            </div>
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
                ) : isRegistered ? (
                  <div className="w-full py-5 rounded-2xl bg-emerald-500/10 text-emerald-500 font-black text-center uppercase tracking-widest border border-emerald-500/20 flex flex-col items-center">
                    <span className="text-2xl mb-1">✓</span>
                    Registration Confirmed
                  </div>
                ) : (
                  <form action={registerForTournament as any} className="space-y-5">
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="mode" value={tournament.participation_mode} />
                    
                    {tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Select Your Team</label>
                          {eligibleTeams.length > 0 ? (
                            <select name="teamId" required className="w-full p-4 rounded-xl bg-background border border-border outline-none text-sm font-bold appearance-none cursor-pointer hover:border-accent-blue/50 focus:border-accent-blue transition-colors">
                              {eligibleTeams.map((team: any) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                              <p className="text-red-500 text-xs font-bold leading-relaxed">
                                You don't have any active teams in the <strong>{tournament.category}</strong> category.
                                Create or join a team from your dashboard first.
                              </p>
                            </div>
                          )}
                        </div>
                        <button 
                          disabled={eligibleTeams.length === 0}
                          className="w-full py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                          Submit Team Roster
                        </button>
                      </>
                    ) : (
                      <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent-blue/20">
                        Secure My Spot
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
