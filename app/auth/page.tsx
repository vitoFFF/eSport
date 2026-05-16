'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signUp, signIn } from '@/actions/auth'
import { Shield, User, LayoutDashboard, Mail, Lock, UserCircle, Loader2, Trophy, Users as UsersIcon } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export default function AuthPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'player' | 'organizer' | 'manager'>('player')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (activeTab === 'register') {
      formData.append('role', role)
    }

    const result = activeTab === 'register' ? await signUp(formData) : await signIn(formData)

    if (result && 'error' in result) {
      setError(result.error ?? 'An unknown error occurred')
      setLoading(false)
    } else if (result && 'success' in result) {
      setSuccess(true)
      setLoading(false)
      if (activeTab === 'register') {
        setActiveTab('login')
        setError(null)
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-32 md:px-6 md:py-36" suppressHydrationWarning>
      <div className="absolute top-1/4 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/12" />
      <div className="absolute bottom-1/4 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px] dark:bg-purple-500/12" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-xl items-center justify-center"
      >
        <div className="w-full rounded-[2rem] border border-border/80 bg-card/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-border/50 dark:bg-card/70 sm:p-8">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.86 }}
              animate={{ scale: 1 }}
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            >
              <Trophy className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {activeTab === 'login' ? t("auth.signIn") : t("auth.signUp")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === 'login' ? t("auth.signInDesc") : t("auth.signUpDesc")}
            </p>
          </div>

          <div className="mb-6 flex rounded-2xl border border-border bg-muted p-1.5 shadow-inner dark:shadow-none">
            <button
              onClick={() => {
                setActiveTab('login')
                setError(null)
              }}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${activeTab === 'login'
                  ? 'bg-card text-accent-blue shadow-[0_10px_24px_rgba(59,130,246,0.16)] dark:bg-muted-foreground/10'
                  : 'text-muted-foreground hover:bg-card/70 hover:text-foreground'
                }`}
            >
              {t("auth.tabSignIn")}
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setError(null)
              }}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${activeTab === 'register'
                  ? 'bg-card text-accent-blue shadow-[0_10px_24px_rgba(59,130,246,0.16)] dark:bg-muted-foreground/10'
                  : 'text-muted-foreground hover:bg-card/70 hover:text-foreground'
                }`}
            >
              {t("auth.tabSignUp")}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {t("auth.regSuccess")}
                </div>
              )}

              {activeTab === 'register' && (
                <>
                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-foreground/60">{t("auth.accountType")}</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('player')}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${role === 'player'
                            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500 shadow-[0_12px_28px_rgba(6,182,212,0.14)]'
                            : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted dark:bg-transparent'
                          }`}
                      >
                        <User className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{t("auth.player")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('manager')}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${role === 'manager'
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 shadow-[0_12px_28px_rgba(16,185,129,0.14)]'
                            : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted dark:bg-transparent'
                          }`}
                      >
                        <UsersIcon className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{t("auth.manager")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('organizer')}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${role === 'organizer'
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-500 shadow-[0_12px_28px_rgba(59,130,246,0.14)]'
                            : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted dark:bg-transparent'
                          }`}
                      >
                        <Shield className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{t("auth.organizer")}</span>
                      </button>
                    </div>
                  </div>

                  <InputField
                    label={role === 'player' ? t("auth.fullName") : role === 'manager' ? t("auth.teamName") : t("auth.companyName")}
                    name="fullName"
                    type="text"
                    placeholder={role === 'player' ? "John Doe" : role === 'manager' ? "Team Name" : "Company Name"}
                    icon={<UserCircle className="h-5 w-5" />}
                  />

                  <InputField
                    label={t("auth.username")}
                    name="username"
                    type="text"
                    placeholder="oranization"
                    icon={<LayoutDashboard className="h-5 w-5" />}
                  />
                </>
              )}

              <InputField
                label={t("auth.email")}
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-5 w-5" />}
              />

              <InputField
                label={t("auth.password")}
                name="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-5 w-5" />}
              />

              <button
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-bold text-white shadow-[0_16px_42px_rgba(59,130,246,0.26)] transition-all hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("auth.processing")}
                  </>
                ) : activeTab === 'login' ? (
                  t("auth.tabSignIn")
                ) : (
                  t("auth.createAccount")
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

type InputFieldProps = {
  label: string
  name: string
  type: string
  placeholder: string
  icon: React.ReactNode
}

function InputField({ label, name, type, placeholder, icon }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="group relative" suppressHydrationWarning>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent-blue">
          {icon}
        </span>
        <input
          name={name}
          type={type}
          required
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-accent-blue/60 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 dark:focus:ring-accent-blue/50"
        />
      </div>
    </div>
  )
}
