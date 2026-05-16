"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, LineChart, Target, Zap, Rocket, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const FeatureItem = ({ icon: Icon, title, description, color }: { icon: LucideIcon, title: string, description: string, color: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl glass border border-border/50 hover:border-border/80 transition-all group"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Features = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: LineChart,
      title: t("features.analytics.title"),
      description: t("features.analytics.description"),
      color: "bg-accent-blue glow-blue",
    },
    {
      icon: Users,
      title: t("features.cards.title"),
      description: t("features.cards.description"),
      color: "bg-accent-purple glow-purple",
    },
    {
      icon: Rocket,
      title: t("features.scouting.title"),
      description: t("features.scouting.description"),
      color: "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]",
    },
    {
      icon: Target,
      title: t("features.hosting.title"),
      description: t("features.hosting.description"),
      color: "bg-accent-blue glow-blue",
    },
    {
      icon: Zap,
      title: t("features.updates.title"),
      description: t("features.updates.description"),
      color: "bg-accent-purple glow-purple",
    },
    {
      icon: BarChart3,
      title: t("features.leaderboards.title"),
      description: t("features.leaderboards.description"),
      color: "bg-slate-700 shadow-[0_0_20px_rgba(51,65,85,0.4)]",
    },
  ];

  return (
    <section className="py-16 bg-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-tight">
            {t("features.badge")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple">{t("features.badgeAccent")}</span>.
          </h2>
          <p className="text-muted-foreground font-medium">
            {t("features.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
