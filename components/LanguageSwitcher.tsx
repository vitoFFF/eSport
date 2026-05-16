"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ChevronDown, Check } from "lucide-react";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "ka", label: "ქართული", short: "KA" },
  ];

  const activeLang = languages.find((l) => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/50 hover:bg-background/80 hover:border-accent-blue/30 transition-all duration-300 group"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue group-hover:scale-110 transition-transform">
          <Languages size={14} />
        </div>
        <span className="text-[13px] font-black tracking-tight text-foreground/80 group-hover:text-foreground">
          {activeLang?.short}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 origin-top-right rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50"
            >
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code as any);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      locale === lang.code
                        ? "bg-accent-blue text-white"
                        : "text-muted-foreground hover:bg-accent-blue/10 hover:text-accent-blue"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {locale === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
