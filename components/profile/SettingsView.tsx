'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Bell, Shield, Eye, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsView() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const themeOptions = [
    { id: 'light', name: 'Light', icon: Sun, color: 'text-amber-500' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'text-accent-blue' },
    { id: 'system', name: 'System', icon: Monitor, color: 'text-muted-foreground' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 dash-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-3xl -z-10 group-hover:bg-accent-blue/10 transition-colors" />
        
        <div className="flex items-center gap-4 mb-10">
          <div className="h-12 w-12 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Eye size={24} className="text-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Appearance</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Customize your viewing experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const isActive = theme === option.id
            const Icon = option.icon
            
            // Reversing logic: Light card is light, Dark card is dark
            const cardBg = option.id === 'light' ? 'bg-white' : option.id === 'dark' ? 'bg-slate-950' : 'bg-muted/20'
            const cardText = option.id === 'light' ? 'text-slate-900' : option.id === 'dark' ? 'text-white' : 'text-muted-foreground'
            const cardBorder = isActive ? 'border-accent-blue ring-2 ring-accent-blue/20' : 'border-border'

            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`relative flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all ${cardBg} ${cardText} ${cardBorder} ${
                  !isActive && 'hover:scale-[1.02] opacity-80 hover:opacity-100'
                }`}
              >
                <div className={`p-4 rounded-2xl ${option.id === 'light' ? 'bg-slate-100' : 'bg-white/10'} transition-colors`}>
                  <Icon 
                    size={28}
                    className={isActive ? 'text-accent-blue' : option.color} 
                  />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{option.name}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="theme-active"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-blue border-4 border-background flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 dash-card opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Bell size={20} className="text-muted-foreground" />
            </div>
            <h4 className="text-lg font-black tracking-tight">Notifications</h4>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Manage how you receive alerts for match starts, team invites, and tournament updates.
          </p>
          <div className="mt-6 pt-6 border-t border-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">Coming Soon</span>
          </div>
        </div>

        <div className="p-10 dash-card opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Shield size={20} className="text-muted-foreground" />
            </div>
            <h4 className="text-lg font-black tracking-tight">Security</h4>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Protect your account with two-factor authentication and manage active sessions.
          </p>
          <div className="mt-6 pt-6 border-t border-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
