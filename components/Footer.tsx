import React from "react";
import Link from "next/link";
import { Trophy, MessageSquare, Camera, Video, Code2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 pt-20 pb-10 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-accent-blue rounded flex items-center justify-center glow-blue">
                <Trophy className="text-white" size={18} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground">
                Match<span className="text-accent-blue">Point</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The premier platform for eSports and physical sports tournaments. 
              Elevate your competitive career with pro-level analytics and networking.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="#" className="p-2 bg-muted rounded-lg hover:bg-accent-blue hover:text-white transition-all text-muted-foreground">
                <MessageSquare size={18} />
              </Link>
              <Link href="#" className="p-2 bg-muted rounded-lg hover:bg-accent-blue hover:text-white transition-all text-muted-foreground">
                <Camera size={18} />
              </Link>
              <Link href="#" className="p-2 bg-muted rounded-lg hover:bg-blue-600 hover:text-white transition-all text-muted-foreground">
                <Video size={18} />
              </Link>
              <Link href="#" className="p-2 bg-muted rounded-lg hover:bg-slate-700 hover:text-white transition-all text-muted-foreground">
                <Code2 size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Tournaments</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Leaderboards</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Player Cards</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Teams</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Partners</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Contact</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors text-sm">Sponsorships</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">Join our newsletter for tournament updates.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-input border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-accent-blue transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-accent-blue text-white text-xs font-bold transition-all hover:bg-blue-600">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Sponsor Placeholders */}
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-8 opacity-30 grayscale hover:grayscale-0 transition-all">
            <span className="text-foreground font-black italic tracking-tighter">SPONSOR A</span>
            <span className="text-foreground font-black italic tracking-tighter text-xl">BRAND B</span>
            <span className="text-foreground font-black italic tracking-tighter">GLOBAL X</span>
          </div>
          <p className="text-muted-foreground text-xs">
            © 2026 MatchPoint. All rights reserved. Built for the next generation of athletes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
