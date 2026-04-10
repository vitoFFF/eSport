import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Plus, Users, Trophy, DollarSign, ArrowUpRight, PlayCircle, MoreHorizontal } from "lucide-react";

export default async function OrganizerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Organizer Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Welcome back, {profile?.full_name || profile?.username || "Organizer"}. Here's what's happening.
          </p>
        </div>
        
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)] active:scale-95">
          <Plus size={18} />
          Create New Championship
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1 */}
        <div className="flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
              <Trophy size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <ArrowUpRight size={14} className="mr-1" />
              12%
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Tournaments</p>
            <p className="mt-1 text-4xl font-black tabular-nums tracking-tighter text-foreground">14</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-purple/10 text-accent-purple">
              <Users size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <ArrowUpRight size={14} className="mr-1" />
              24%
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Registered Players</p>
            <p className="mt-1 text-4xl font-black tabular-nums tracking-tighter text-foreground">1,248</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Prize Pool</p>
            <p className="mt-1 text-4xl font-black tabular-nums tracking-tighter text-foreground">$45,000</p>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Tournaments */}
        <div className="col-span-2 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Championships</h2>
            <Link href="#" className="text-sm font-semibold text-accent-blue hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-border/30 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
                    <PlayCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">VALORANT Winter Cup {i}</h4>
                    <p className="text-xs font-semibold text-muted-foreground">32 Teams · Starts in 2 Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-foreground">$10,000</p>
                    <p className="text-xs font-semibold text-emerald-500">Prize Pool</p>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-foreground">Pending Approvals</h2>
          
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border/30 bg-muted/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Team Liquid Registration</p>
                    <p className="text-xs font-medium text-muted-foreground">CS:GO Major League</p>
                  </div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/20">Review</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 rounded-lg bg-emerald-500/10 py-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-colors">Approve</button>
                  <button className="flex-1 rounded-lg bg-red-500/10 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-accent-purple/5 p-4 border border-accent-purple/10 relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={80} />
            </div>
            <h3 className="font-bold text-accent-purple">Pro Tip!</h3>
            <p className="mt-1 text-xs font-medium text-muted-foreground leading-relaxed">
              Adding custom branding to your tournaments increases player registrations by up to 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
