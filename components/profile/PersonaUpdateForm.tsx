'use client'

import { useState } from 'react'
import { User, Save, CheckCircle2, AlertCircle, Gamepad2, Camera, Loader2 } from 'lucide-react'
import { updateProfile } from '@/actions/profile'
import { createClient } from '@/utils/supabase/client'
import { useRef } from 'react'

interface PersonaUpdateFormProps {
  profile: any
}

const AVAILABLE_GAMES = [
  'Valorant', 'League of Legends', 'CS:GO', 'Dota 2', 
  'Rocket League', 'FIFA', 'Call of Duty', 'Overwatch 2'
]

export default function PersonaUpdateForm({ profile }: PersonaUpdateFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedGames, setSelectedGames] = useState<string[]>(profile?.games || [])
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(profile?.avatar_url || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleGame = (game: string) => {
    setSelectedGames(prev => 
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    )
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setCurrentAvatarUrl(publicUrl)
      setMessage({ type: 'success', text: 'Image uploaded! Remember to save changes.' })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Upload failed: ' + error.message })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    selectedGames.forEach(game => formData.append('games', game))

    const result = await updateProfile(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setLoading(false)
  }

  return (
    <div className="p-10 dash-card relative overflow-hidden group max-w-4xl mx-auto">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-3xl -z-10 group-hover:bg-accent-blue/10 transition-colors" />
      
      <div className="flex items-center gap-8 mb-12">
        <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center text-white shadow-2xl shadow-accent-blue/20 overflow-hidden relative border-4 border-card transition-transform group-hover/avatar:scale-105">
            {currentAvatarUrl ? (
              <img src={currentAvatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {isUploading ? (
                <Loader2 size={24} className="animate-spin text-white" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-4 border-card" />
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <div className="text-left">
          <h3 className="text-3xl font-black tracking-tight">{profile.full_name}</h3>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">@{profile.username} • Account Config</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 text-left">
        {message && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bio & Competitive Philosophy</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio || ''}
              placeholder="Tell us about your journey..."
              className="w-full min-h-[180px] rounded-3xl border border-border bg-muted/20 p-6 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gaming Disciplines</label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_GAMES.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => toggleGame(game)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedGames.includes(game)
                      ? 'bg-accent-blue text-white border-accent-blue shadow-lg shadow-accent-blue/20'
                      : 'bg-muted/30 border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  <Gamepad2 size={16} />
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>

        <input type="hidden" name="fullName" value={profile?.full_name} />
        <input type="hidden" name="username" value={profile?.username} />
        <input type="hidden" name="avatarUrl" value={currentAvatarUrl || ''} />

        <div className="flex justify-end pt-6 border-t border-border/50">
          <button
            disabled={loading}
            className="group relative flex items-center justify-center gap-4 px-12 py-5 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">{loading ? 'Processing...' : 'Update Player Persona'}</span>
            {!loading && <Save size={20} className="relative z-10" />}
          </button>
        </div>
      </form>
    </div>
  )
}
