'use client'

import { useState } from 'react'
import { createTeam } from '@/actions/profile'
import { createOrganization } from '@/actions/organizations'
import { invitePlayer } from '@/actions/profile'
import { Users, UserPlus, Trophy, PlusCircle, Building2, LayoutGrid, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrganizationManagerProps {
  profile: any
  organization: any
  teams: any[]
}

export default function OrganizationManager({ profile, organization, teams }: OrganizationManagerProps) {
  const [loading, setLoading] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleCreateOrganization(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createOrganization(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Organization created successfully!' })
    setLoading(false)
  }

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('organizationId', organization.id)
    const result = await createTeam(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Team created successfully!' })
    setLoading(false)
  }

  if (!organization) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border bg-muted/30">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-black text-foreground">No Organization Found</h2>
          <p className="text-muted-foreground mt-2 mb-8">As a manager, you must first create an Organization to manage your teams.</p>
          
          <form onSubmit={handleCreateOrganization} className="max-w-md mx-auto space-y-4">
             <div className="space-y-2 text-left">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Organization Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g., Cloud9 Esports"
                  className="w-full rounded-2xl border border-border bg-card p-4 text-foreground focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
             </div>
             <button
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
             >
                {loading ? 'Creating...' : 'Create Organization'}
             </button>
             {message && <p className={`mt-2 text-[10px] font-bold ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Organization Header */}
      <div className="flex items-center gap-4 p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
          <Building2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground">{organization.name}</h2>
          <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Organization Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Teams List */}
        <div className="lg:col-span-2 h-full">
          <div className="p-8 rounded-[2.5rem] border border-border bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-xl shadow-xl shadow-foreground/5 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] -z-10" />
            
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 shrink-0">
               <div className="p-2 rounded-xl bg-foreground/5 text-foreground">
                 <LayoutGrid size={18} />
               </div>
               Your Teams Roster
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-2000 flex-grow">
              {teams?.length > 0 ? teams.map((team: any) => (
                <div 
                  key={team.id} 
                  onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                  className="group relative flex flex-col h-full p-6 rounded-[2.5rem] border border-border/50 luxury-glass hover:border-accent-blue/40 transition-all duration-500 shadow-3d hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-2 transform-gpu cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-accent-blue/20 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-extrabold text-foreground text-2xl group-hover:text-accent-blue transition-colors tracking-tight truncate">{team.name}</h4>
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1 opacity-60">Tap to manage roster</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-lg shadow-sm shrink-0">
                      {team.category === 'football' ? '⚽' : 
                       team.category === 'tennis' ? '🎾' : 
                       team.category === 'padel' ? '🏸' : 
                       team.category === 'esport' ? '🎮' : team.category}
                    </div>
                  </div>

                  <div className="flex -space-x-3 mb-2 flex-grow relative z-10">
                    {team.team_members?.slice(0, 5).map((member: any) => (
                      <div key={member.id} className="h-10 w-10 rounded-full border-2 border-card bg-muted flex items-center justify-center z-10 overflow-hidden relative group/avatar shadow-sm transition-transform hover:scale-110 hover:z-20" title={`${member.profiles?.username} (${member.status})`}>
                        {member.profiles?.avatar_url ? (
                          <img src={member.profiles.avatar_url} alt="avatar" className={`w-full h-full object-cover ${member.status === 'pending' ? 'opacity-50 grayscale' : ''}`} />
                        ) : (
                          <Users size={16} className={`text-muted-foreground ${member.status === 'pending' ? 'opacity-50' : ''}`} />
                        )}
                        {member.status === 'pending' && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-card"></span>}
                      </div>
                    ))}
                    {team.team_members?.length > 5 && (
                      <div className="h-10 w-10 rounded-full border-2 border-card bg-foreground/5 flex items-center justify-center z-0 backdrop-blur-md">
                        <span className="text-[10px] font-black text-foreground">+{team.team_members.length - 5}</span>
                      </div>
                    )}
                    {(!team.team_members || team.team_members.length === 0) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground italic font-semibold h-10">
                         <div className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                           <Users size={14} className="opacity-50" />
                         </div>
                         Empty Roster
                      </div>
                    )}
                  </div>
                  
                  {/* Expanded View for managing members */}
                  {expandedTeamId === team.id && (
                    <div 
                      className="mt-8 pt-6 border-t border-dashed border-border/80 animate-in slide-in-from-top-4 duration-300 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md px-4 py-0.5 rounded-full border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                        Configuration
                      </div>
                      
                      {team.team_members?.length > 0 && (
                        <div className="space-y-2 mb-8">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Current Roster</h5>
                          {team.team_members.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-white/5 hover:border-border/30 transition-colors">
                              <div className="flex items-center gap-3 text-sm font-bold text-foreground min-w-0 pr-2">
                                <div className="h-8 w-8 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                                  {member.profiles?.avatar_url ? (
                                    <img src={member.profiles?.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="truncate text-xs">{member.profiles?.full_name || member.profiles?.username}</span>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                member.status === 'joined' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {member.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <h5 className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-4 flex items-center gap-2">
                        <UserPlus size={14} /> Send Invitation
                      </h5>
                      <form action={async (formData) => {
                        const res = await invitePlayer(formData)
                        if (res.error) setMessage({ type: 'error', text: res.error })
                        else setMessage({ type: 'success', text: 'Invitation sent successfully!' })
                      }} className="flex gap-2 relative">
                         <input type="hidden" name="teamId" value={team.id} />
                         <div className="relative flex-1">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">@</span>
                           <input 
                             name="username" 
                             placeholder="username" 
                             required
                             className="w-full rounded-xl border border-border/80 bg-input pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue outline-none transition-all placeholder:text-muted-foreground/40 font-semibold" 
                           />
                         </div>
                         <button type="submit" className="px-6 py-3 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                           Invite
                         </button>
                      </form>
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 rounded-3xl border border-dashed border-border bg-muted/10">
                  <PlusCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-foreground font-bold">No Rosters Found.</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Create your first team using the panel to the right.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Team Form & Actions */}
        <div className="h-full">
          <div className="p-8 rounded-[2.5rem] border border-border/50 bg-gradient-to-ar from-card to-muted/30 backdrop-blur-xl shadow-xl shadow-foreground/5 h-full flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2 shrink-0">
              <PlusCircle className="text-accent-blue" size={16} /> New Team Form
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-5 flex-grow flex flex-col">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Team Identity</label>
                 <input
                   name="name"
                   required
                   placeholder="e.g. Phoenix Rising"
                   className="w-full rounded-2xl border border-border/80 bg-input p-4 text-sm font-semibold focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue outline-none transition-all placeholder:text-muted-foreground/40"
                 />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Discipline Category</label>
                 <div className="relative">
                    <input type="hidden" name="category" value={selectedCategory} required />
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-full rounded-2xl border border-border/80 bg-input p-4 text-sm font-semibold flex items-center justify-between focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue outline-none transition-all cursor-pointer text-foreground group"
                    >
                      <span className={selectedCategory ? "text-foreground" : "text-muted-foreground/40"}>
                        {selectedCategory ? (
                          <span className="flex items-center gap-2">
                            {selectedCategory === 'football' ? '⚽ Football' :
                             selectedCategory === 'tennis' ? '🎾 Tennis' :
                             selectedCategory === 'padel' ? '🏸 Padel' :
                             selectedCategory === 'esport' ? '🎮 eSport' : selectedCategory}
                          </span>
                        ) : "Select Sport / Game"}
                      </span>
                      <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isCategoryDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setIsCategoryDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 right-0 mt-2 p-2 rounded-2xl bg-card border border-white/10 shadow-3d z-[70] overflow-hidden"
                          >
                            {[
                              { id: 'football', label: 'Football', emoji: '⚽' },
                              { id: 'tennis', label: 'Tennis', emoji: '🎾' },
                              { id: 'padel', label: 'Padel', emoji: '🏸' },
                              { id: 'esport', label: 'eSport', emoji: '🎮' },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat.id)
                                  setIsCategoryDropdownOpen(false)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-accent-blue/10 hover:text-accent-blue transition-all text-left group/item"
                              >
                                <span className="text-lg group-hover/item:scale-110 transition-transform">{cat.emoji}</span>
                                {cat.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
              </div>

              <button
                disabled={loading}
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-accent-blue to-blue-700 text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl hover:shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Initializing...' : 'Construct Roster'}
              </button>
            </form>
            {message && (
              <div className={`mt-6 p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center ${
                 message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {message.type === 'success' ? '✓ ' : '! '}
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
