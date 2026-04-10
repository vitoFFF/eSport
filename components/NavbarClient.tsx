"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Trophy, User, LayoutDashboard, Home, Search, LogOut, Gamepad2, Activity, Target } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "@/actions/auth";

type NavbarClientProps = {
  isAuthenticated: boolean;
  role?: "admin" | "player" | "organizer";
  username?: string | null;
};

const NavbarClient = ({ isAuthenticated, role, username }: NavbarClientProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardHref =
    role === "organizer" ? "/dashboard/organizer" : role === "admin" ? "/dashboard/admin" : "/dashboard/player";

  const navLinks = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Football", href: "/tournaments?category=football", icon: <Trophy size={18} /> },
    { name: "Tennis", href: "/tournaments?category=tennis", icon: <Activity size={18} /> },
    { name: "Padel", href: "/tournaments?category=padel", icon: <Target size={18} /> },
    { name: "eSport", href: "/tournaments?category=esport", icon: <Gamepad2 size={18} /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-3 md:px-0 ${
        isScrolled ? "pt-4 md:pt-6" : "pt-6 md:pt-8"
      }`}
    >
      <div
        className={`mx-auto flex w-[98%] max-w-7xl items-center justify-between rounded-full border px-4 py-3 md:px-6 md:py-3.5 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "border-border/40 bg-background/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:shadow-none"
            : "border-border/20 bg-background/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-md dark:shadow-none"
        }`}
      >
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition-transform group-hover:scale-110">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transition-colors group-hover:text-accent-blue md:text-3xl">
            Match<span className="text-accent-blue">Point</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center space-x-1 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-accent-blue dark:hover:text-foreground"
            >
              <span>{link.name}</span>
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href={dashboardHref}
              className="relative flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-bold text-accent-blue bg-accent-blue/5 border border-accent-blue/10 hover:bg-accent-blue/10 transition-all glow-blue group"
            >
              <LayoutDashboard size={16} className="group-hover:scale-110 transition-transform" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <button className="p-2 text-muted-foreground transition-colors hover:text-foreground">
            <Search size={20} />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {username ? `@${username}` : "Profile"}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition-all hover:brightness-110 active:scale-95"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-6 py-2 text-white font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition-all hover:brightness-110 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          className="text-slate-950 dark:text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-[1.5rem] border border-border bg-card/95 shadow-2xl backdrop-blur-xl md:hidden dark:border-border/50 dark:bg-card/98"
          >
            <div className="flex flex-col space-y-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-3 rounded-2xl px-3 py-2 text-lg font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 rounded-2xl px-3 py-2 text-lg font-bold text-accent-blue bg-accent-blue/5 border border-accent-blue/10 transition-colors hover:bg-accent-blue/10"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              )}
              <div className="flex flex-col space-y-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Switch Theme</span>
                  <ThemeToggle />
                </div>
                <button className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Search size={20} />
                  <span>Search</span>
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full rounded-xl border border-border py-3 text-center font-semibold text-muted-foreground hover:bg-muted"
                    >
                      {username ? `@${username}` : "Profile"}
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple py-3 text-center font-bold text-white"
                      >
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple py-3 text-center font-bold text-white"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavbarClient;
