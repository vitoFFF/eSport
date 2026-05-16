"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Trophy, User, LayoutDashboard, Home, Search, LogOut, Gamepad2, Activity, Target } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut } from "@/actions/auth";
import { useLanguage } from "@/lib/LanguageContext";

type NavbarClientProps = {
  isAuthenticated: boolean;
  role?: "admin" | "player" | "organizer";
  username?: string | null;
};

const NavbarClient = ({ isAuthenticated, role, username }: NavbarClientProps) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardHref = "/profile";

  const navLinks = [
    { name: t("nav.home"), href: "/", icon: <Home size={18} />, color: "hover:text-blue-700 hover:bg-blue-700/20", glow: "bg-blue-700" },
    { name: t("nav.football"), href: "/tournaments?category=football", icon: <span className="text-lg">⚽</span>, color: "hover:text-emerald-700 hover:bg-emerald-700/20", glow: "bg-emerald-700" },
    { name: t("nav.tennis"), href: "/tournaments?category=tennis", icon: <span className="text-lg">🎾</span>, color: "hover:text-amber-700 hover:bg-amber-700/20", glow: "bg-amber-700" },
    { name: t("nav.padel"), href: "/tournaments?category=padel", icon: <span className="text-lg">🏸</span>, color: "hover:text-orange-700 hover:bg-orange-700/20", glow: "bg-orange-700" },
    { name: t("nav.esport"), href: "/tournaments?category=esport", icon: <span className="text-lg">🎮</span>, color: "hover:text-purple-700 hover:bg-purple-700/20", glow: "bg-purple-700" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-3 md:px-0 ${isScrolled ? "pt-3 md:pt-4" : "pt-4 md:pt-6"
        }`}
    >
      <div
        className="mx-auto flex w-[98%] max-w-[1500px] items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-2.5 md:px-6 lg:px-8 md:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-3xl transition-all duration-500 ease-in-out dark:bg-card/90 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
      >
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition-transform group-hover:scale-110">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transition-colors group-hover:text-blue-700 lg:text-3xl">
            Match<span className="text-accent-blue">Point</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`group relative flex items-center rounded-full px-3 lg:px-4 py-2 text-sm lg:text-[15px] font-bold text-foreground outline-none transition-all duration-300 ${link.color}`}
            >
              {/* Hover Background Layer */}
              <div className={`absolute inset-0 scale-75 rounded-full opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 dark:bg-white/5`} />

              {/* Expanding Bottom Glow Line */}
              <div className={`absolute bottom-1 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full ${link.glow} opacity-0 transition-all duration-300 ease-out group-hover:w-3/5 group-hover:opacity-100 dark:bg-white`} />

              <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                <span className="opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:text-inherit">
                  {link.icon}
                </span>
                <span className="tracking-wide">{link.name}</span>
              </span>
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href={dashboardHref}
              className="relative flex items-center space-x-2 lg:space-x-3 rounded-full px-3 lg:px-5 py-2 text-sm font-bold text-accent-blue bg-accent-blue/5 border border-accent-blue/10 hover:bg-accent-blue/15 hover:text-blue-700 transition-all glow-blue group whitespace-nowrap"
            >
              <LayoutDashboard size={16} className="group-hover:scale-110 transition-transform" />
              <span>{t("nav.dashboard")}</span>
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/20 transition-all hover:scale-105 active:scale-95"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 origin-top-right rounded-[2rem] border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                    >
                      <div className="p-4 border-b border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t("dashboard.signedInAs")}</p>
                        <p className="text-sm font-bold text-foreground truncate">{username || "User"}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-accent-blue/10 hover:text-accent-blue transition-all group/item"
                        >
                          <LayoutDashboard size={18} className="group-hover/item:scale-110 transition-transform" />
                          Dashboard
                        </Link>

                        <form action={signOut} className="w-full">
                          <button
                            type="submit"
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all group/item"
                          >
                            <LogOut size={18} className="group-hover/item:translate-x-1 transition-transform" />
                            {t("nav.signOut")}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-gradient-to-r from-accent-blue to-accent-purple px-4 lg:px-6 py-2 text-white font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition-all hover:brightness-110 active:scale-95 text-xs lg:text-sm"
            >
              {t("nav.signIn")}
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
                  className={`group flex items-center space-x-4 rounded-2xl px-4 py-3 text-lg font-bold text-muted-foreground transition-all duration-300 ${link.color} dark:hover:bg-white/5`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted transition-colors duration-300 group-hover:bg-opacity-20 dark:bg-card dark:group-hover:bg-white/10 group-hover:text-inherit`}>
                    {link.icon}
                  </span>
                  <span className="tracking-wide">{link.name}</span>
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
                  <span className="font-medium text-muted-foreground">Language</span>
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Switch Theme</span>
                  <ThemeToggle />
                </div>
                <button className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Search size={20} />
                  <span>{t("common.search")}</span>
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
