'use client'

import { useState } from 'react'
import { submitScore, confirmScore, disputeScore } from '@/actions/matches'
import { CheckCircle, AlertOctagon, Send, ShieldAlert, CheckSquare } from 'lucide-react'

// Defining a dynamic Match type that contains category config inside the match or passed into the component
interface MatchValidationCardProps {
  match: {
    id: string
    tournament_id: string
    home_team_id?: string
    away_team_id?: string
    home_score: number | null
    away_score: number | null
    status: 'pending' | 'submitted' | 'confirmed' | 'disputed' | 'finalized'
    category: 'football' | 'tennis' | 'padel' | 'esport'
  }
  isHomeTeam: boolean
  isAwayTeam: boolean
  isOrganizer: boolean
}

export default function MatchValidationCard({ match, isHomeTeam, isAwayTeam, isOrganizer }: MatchValidationCardProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Handlers
  async function handleScoreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const homeScore = parseInt(formData.get('homeScore') as string)
    const awayScore = parseInt(formData.get('awayScore') as string)

    // Example logic for details could go here, e.g., Set scores for Tennis
    let details = {}
    if (match.category === 'tennis' || match.category === 'padel') {
      details = {
         sets: formData.get('sets') // Just a pseudo example
      }
    }

    const result = await submitScore(match.id, homeScore, awayScore, details)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Score submitted! Awaiting opponent confirmation.' })
    setLoading(false)
  }

  async function handleConfirm() {
    setLoading(true)
    const result = await confirmScore(match.id)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Match score has been officially confirmed.' })
    setLoading(false)
  }

  async function handleDispute() {
    if (!window.confirm("Are you sure you want to dispute this match score? Conflict resolution requires Organizer intervention.")) return
    setLoading(true)
    const result = await disputeScore(match.id)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'error', text: 'Match Disputed! Organizer has been notified.' }) // Marked as error color for UI impact
    setLoading(false)
  }

  // Visual cues
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-amber-500 bg-amber-500/10'
      case 'confirmed': 
      case 'finalized': return 'text-emerald-500 bg-emerald-500/10'
      case 'disputed': return 'text-red-500 bg-red-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden shadow-black/5 flex flex-col">
       <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
          <div className="flex gap-2 items-center">
             <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Match #{match.id.substring(0, 4)}</span>
             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(match.status)}`}>
               {match.status}
             </span>
          </div>
          {isOrganizer && (
             <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1">
               <ShieldAlert size={10} /> Override Active
             </span>
          )}
       </div>

       <div className="p-6">
          <div className="flex justify-between items-center mb-6 px-4">
             <div className="text-center w-24">
                <div className="h-12 w-12 mx-auto rounded-xl bg-muted border border-border shadow-inner mb-2" />
                <p className={`text-xs font-black truncate ${isHomeTeam ? 'text-accent-blue' : 'text-foreground'}`}>Home Team</p>
             </div>
             <div className="text-2xl font-black text-muted-foreground/30 px-4 flex items-center gap-4">
               {match.home_score !== null ? (
                 <span className="text-3xl text-foreground">{match.home_score}</span>
               ) : <span className="text-xl">-</span>}
               <span>VS</span>
               {match.away_score !== null ? (
                 <span className="text-3xl text-foreground">{match.away_score}</span>
               ) : <span className="text-xl">-</span>}
             </div>
             <div className="text-center w-24">
                <div className="h-12 w-12 mx-auto rounded-xl bg-muted border border-border shadow-inner mb-2" />
                <p className={`text-xs font-black truncate ${isAwayTeam ? 'text-accent-blue' : 'text-foreground'}`}>Away Team</p>
             </div>
          </div>

          <div className="pt-6 border-t border-border">
             {match.status === 'pending' && (isHomeTeam || isAwayTeam || isOrganizer) && (
               <form onSubmit={handleScoreSubmit} className="space-y-4">
                 <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border">
                    <input 
                      name="homeScore" type="number" required placeholder="H. Score" 
                      className="w-full text-center rounded-xl bg-card border-none py-3 text-lg font-black focus:ring-2 focus:ring-accent-blue outline-none" 
                    />
                    <span className="text-xs font-bold text-muted-foreground">:</span>
                    <input 
                      name="awayScore" type="number" required placeholder="A. Score" 
                      className="w-full text-center rounded-xl bg-card border-none py-3 text-lg font-black focus:ring-2 focus:ring-accent-blue outline-none" 
                    />
                 </div>
                 
                 {/* Sport specific context */}
                 {(match.category === 'tennis' || match.category === 'padel') && (
                   <input
                     name="sets" type="text" placeholder="Set Details e.g. 6-4, 3-6, 7-6"
                     className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                   />
                 )}
                 <button 
                   disabled={loading} type="submit" 
                   className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-accent-blue text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg"
                 >
                   <Send size={14} /> Submit Final Score
                 </button>
               </form>
             )}

             {match.status === 'submitted' && (
               <div className="space-y-4 text-center">
                 <p className="text-xs font-bold text-muted-foreground mb-4">A score has been submitted. Review and action below.</p>
                 <div className="flex gap-3">
                    <button 
                      onClick={handleConfirm} disabled={loading}
                      className="flex-1 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckSquare size={16} /> Confirm
                    </button>
                    <button 
                      onClick={handleDispute} disabled={loading}
                      className="flex-1 py-3 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <AlertOctagon size={16} /> Dispute
                    </button>
                 </div>
               </div>
             )}

             {match.status === 'disputed' && (
               <div className="text-center py-4 bg-red-500/5 rounded-2xl border border-red-500/20">
                 <AlertOctagon className="h-10 w-10 text-red-500 mx-auto mb-2 opacity-50" />
                 <p className="text-xs font-black uppercase tracking-widest text-red-500">Match Disputed</p>
                 <p className="text-[10px] text-muted-foreground mt-1 max-w-[80%] mx-auto font-medium shadow-sm">Organizer has been summoned for conflict resolution.</p>
                 
                 {isOrganizer && (
                   <button className="mt-4 px-6 py-2 bg-foreground text-background font-black text-[10px] uppercase tracking-widest rounded-lg hover:scale-105 transition-transform">
                     Resolve Conflict
                   </button>
                 )}
               </div>
             )}

             {match.status === 'confirmed' && (
               <div className="text-center py-4">
                 <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2 shadow-xl rounded-full" />
                 <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Match Concluded</p>
               </div>
             )}

             {message && <p className={`mt-4 text-center text-[10px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
          </div>
       </div>
    </div>
  )
}
