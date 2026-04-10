import React from "react";
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, BarChart3, LineChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Platform Analytics</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Monitor your organization's growth and engagement.</p>
        </div>
        <div className="flex bg-muted rounded-xl p-1">
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-background shadow-sm text-foreground">7D</button>
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground">30D</button>
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground">12M</button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$124,500", change: "+14.2%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Active Players", value: "8,234", change: "+5.4%", icon: Users, color: "text-accent-blue", bg: "bg-accent-blue/10" },
          { label: "Tournaments Held", value: "42", change: "+12.5%", icon: Activity, color: "text-accent-purple", bg: "bg-accent-purple/10" },
          { label: "Engagement Rate", value: "68.2%", change: "+2.1%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((metric, i) => (
          <div key={i} className="flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${metric.bg} ${metric.color}`}>
                <metric.icon size={20} />
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-3xl font-black tabular-nums tracking-tighter text-foreground">{metric.value}</p>
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-500 pb-1">
                <ArrowUpRight size={14} className="mr-0.5" />
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fake Line Chart */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <LineChart size={18} className="mr-2 text-accent-blue" />
              Registration Trends
            </h2>
          </div>
          
          <div className="relative h-64 w-full flex items-end justify-between gap-2">
            {/* Fake SVG Line spanning across the bars visually */}
            <svg className="absolute inset-0 h-full w-full opacity-50" preserveAspectRatio="none">
              <path 
                d="M 0,200 Q 100,150 200,100 T 400,50 600,150 800,20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-accent-blue"
              />
            </svg>
            
            {[40, 60, 45, 80, 55, 90, 75, 100].map((height, i) => (
              <div key={i} className="group relative w-full h-full flex items-end justify-center">
                <div 
                  className="w-full bg-accent-blue/10 rounded-t-lg transition-all duration-500 hover:bg-accent-blue/30"
                  style={{ height: `${height}%` }}
                />
                <span className="absolute -top-8 text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {height * 10}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
          </div>
        </div>

        {/* Fake Bar Chart */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <BarChart3 size={18} className="mr-2 text-accent-purple" />
              Revenue By Game
            </h2>
          </div>
          
          <div className="h-64 w-full flex flex-col justify-end gap-5">
            {[
              { game: "Valorant", percentage: 85, color: "bg-accent-blue" },
              { game: "CS:GO", percentage: 65, color: "bg-emerald-500" },
              { game: "League of Legends", percentage: 75, color: "bg-accent-purple" },
              { game: "Rocket League", percentage: 40, color: "bg-amber-500" },
            ].map((stat, i) => (
              <div key={i} className="w-full relative">
                <div className="flex justify-between text-xs font-bold text-foreground mb-2">
                  <span>{stat.game}</span>
                  <span>{stat.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-muted overflow-hidden rounded-full">
                  <div 
                    className={`h-full ${stat.color} rounded-full`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
