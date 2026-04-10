"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Users, Activity, Settings } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Helper matching function
  const isActive = (paths: string[]) => paths.includes(pathname);

  const mainLinks = [
    { name: "Overview", href: "/dashboard/organizer", match: ["/dashboard", "/dashboard/organizer", "/dashboard/admin", "/dashboard/player"], icon: LayoutDashboard },
    { name: "Tournaments", href: "/dashboard/tournaments", match: ["/dashboard/tournaments"], icon: Trophy },
    { name: "Teams", href: "/dashboard/teams", match: ["/dashboard/teams"], icon: Users },
    { name: "Analytics", href: "/dashboard/analytics", match: ["/dashboard/analytics"], icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-background pt-[80px] md:pt-[96px]">
      {/* Left Sidebar Navigation */}
      <aside className="sticky top-[96px] hidden h-[calc(100vh-96px)] w-64 flex-col overflow-y-auto border-r border-border/50 bg-card/30 p-6 backdrop-blur-xl md:flex">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Menu</p>
        </div>

        <nav className="flex flex-col space-y-2">
          {mainLinks.map((link) => {
            const active = isActive(link.match);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  active 
                    ? "bg-accent-blue/10 text-accent-blue shadow-sm ring-1 ring-inset ring-accent-blue/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin</p>
          <Link
            href="/dashboard/settings"
            className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              isActive(["/dashboard/settings"])
                ? "bg-accent-blue/10 text-accent-blue shadow-sm ring-1 ring-inset ring-accent-blue/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
