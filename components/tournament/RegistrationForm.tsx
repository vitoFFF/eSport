'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { registerForTournament } from '@/actions/profile';
import TournamentProtocolModal from './TournamentProtocolModal';

function SubmitButton({ label, onClick }: { label: string; onClick?: (e: React.MouseEvent) => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={pending}
      onClick={onClick}
      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${
        pending 
          ? 'bg-muted text-muted-foreground cursor-wait scale-[0.98]' 
          : 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:scale-[1.02] active:scale-95 shadow-accent-blue/20'
      }`}
    >
      {pending ? 'Registering...' : label}
    </button>
  );
}

function TeamSubmitButton({ disabled, onClick }: { disabled: boolean; onClick?: (e: React.MouseEvent) => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={disabled || pending}
      onClick={onClick}
      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${
        pending || disabled
          ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
          : 'bg-foreground text-background hover:scale-[1.02] active:scale-95 shadow-lg'
      }`}
    >
      {pending ? 'Registering...' : 'Register Team'}
    </button>
  );
}

interface RegistrationFormProps {
  tournament: any;
  eligibleTeams: any[];
}

export default function RegistrationForm({ tournament, eligibleTeams }: RegistrationFormProps) {
  const isTeamMode = tournament.participation_mode === 'team' || tournament.participation_mode === 'Team NvN';
  const [error, setError] = useState<string | null>(null);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await registerForTournament(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  const handleProtocolAccept = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <form ref={formRef} action={handleSubmit} className="space-y-5">
        <input type="hidden" name="tournamentId" value={tournament.id} />
        <input type="hidden" name="mode" value={tournament.participation_mode} />

        {isTeamMode ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Select Your Team
              </label>
              {eligibleTeams.length > 0 ? (
                <select
                  name="teamId"
                  required
                  className="w-full p-4 rounded-xl bg-background border border-border outline-none text-sm font-bold appearance-none cursor-pointer hover:border-accent-blue/50 focus:border-accent-blue transition-colors"
                >
                  {eligibleTeams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-xs font-bold leading-relaxed">
                    You don't have any active teams in the <strong>{tournament.category}</strong> category.
                    Create or join a team from your dashboard first.
                  </p>
                </div>
              )}
            </div>
            <TeamSubmitButton 
              disabled={eligibleTeams.length === 0} 
              onClick={() => setIsProtocolOpen(true)}
            />
          </>
        ) : (
          <SubmitButton 
            label="Register" 
            onClick={() => setIsProtocolOpen(true)}
          />
        )}

        {error && (
          <p className="text-red-500 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </form>

      {mounted && createPortal(
        <TournamentProtocolModal
          isOpen={isProtocolOpen}
          onClose={() => setIsProtocolOpen(false)}
          onAccept={handleProtocolAccept}
          tournament={tournament}
        />,
        document.body
      )}
    </>
  );
}
