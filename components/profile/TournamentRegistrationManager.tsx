'use client'

import { useState } from 'react'
import { registerForTournament } from '@/actions/profile'
import { Trophy, Users, Calendar, ArrowRight, CheckCircle2, AlertCircle, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TournamentRegistrationManagerProps {
  tournaments: any[]
  teams: any[]
}

export default function TournamentRegistrationManager({ tournaments, teams }: TournamentRegistrationManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [selectedTeamPerTournament, setSelectedTeamPerTournament] = useState<Record<string, any>>({})

  async function handleRegister(e: React.FormEvent<HTMLFormElement>, tournamentId: string) {
    e.preventDefault()
    setLoading(tournamentId)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await registerForTournament(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Team registered successfully!' })
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 p-4 rounded-2xl text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 perspective-2000">
        {tournaments.map((tournament) => {
          const eligibleTeams = teams.filter(t => t.category === tournament.category)

          return (
            <div key={tournament.id} className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.5rem] border border-white/10 luxury-glass shadow-3d hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 transform-gpu">
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-blue/5 to-transparent pointer-events-none rounded-[2.5rem]" />

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10 w-full">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    <Trophy className="text-accent-blue h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{tournament.name}</h3>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-xs shadow-sm shadow-accent-blue/5">
                        {tournament.category === 'football' ? '⚽' : 
                         tournament.category === 'tennis' ? '🎾' : 
                         tournament.category === 'padel' ? '🏸' : 
                         tournament.category === 'esport' ? '🎮' : tournament.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={14} /> {tournament.participation_mode}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(tournament.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => handleRegister(e, tournament.id)} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input type="hidden" name="tournamentId" value={tournament.id} />
                  <input type="hidden" name="mode" value={tournament.participation_mode} />

                  {eligibleTeams.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
                      <div className="relative md:w-56">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(openDropdownId === tournament.id ? null : tournament.id)}
                          className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-background border border-border text-xs font-bold hover:border-accent-blue/50 transition-all outline-none"
                        >
                          <span className="truncate">
                            {selectedTeamPerTournament[tournament.id]?.name || "Select Team"}
                          </span>
                          <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-300 ${openDropdownId === tournament.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <input type="hidden" name="teamId" value={selectedTeamPerTournament[tournament.id]?.id || ''} required />

                        <AnimatePresence>
                          {openDropdownId === tournament.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 mt-2 p-2 rounded-2xl border border-border bg-card shadow-2xl z-50 backdrop-blur-xl max-h-48 overflow-y-auto no-scrollbar"
                              >
                                {eligibleTeams.map(team => (
                                  <button
                                    key={team.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedTeamPerTournament({ ...selectedTeamPerTournament, [tournament.id]: team })
                                      setOpenDropdownId(null)
                                    }}
                                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold hover:bg-accent-blue/10 hover:text-accent-blue transition-colors group/item"
                                  >
                                    <span className="truncate">{team.name}</span>
                                    {selectedTeamPerTournament[tournament.id]?.id === team.id && <Check className="h-3 w-3 text-accent-blue" />}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        disabled={loading === tournament.id || !selectedTeamPerTournament[tournament.id]}
                        className="px-6 py-3 rounded-xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {loading === tournament.id ? 'Registering...' : 'Register'}
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] font-bold text-red-500 max-w-[200px]">
                      No active {tournament.category} teams found.
                    </div>
                  )}
                </form>
              </div>
            </div>
          )
        })}

        {tournaments.length === 0 && (
          <div className="py-20 text-center border border-dashed border-border rounded-[2rem]">
            <Trophy size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-bold font-italic">No tournaments available for registration at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
