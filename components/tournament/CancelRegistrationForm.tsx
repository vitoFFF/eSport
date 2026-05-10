'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { cancelRegistration } from '@/actions/profile';

function CancelSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${
        pending 
          ? 'bg-muted text-muted-foreground border-border cursor-wait' 
          : 'border-red-500/20 text-red-500 hover:bg-red-500/10 active:scale-95'
      }`}
    >
      {pending ? 'Cancelling...' : 'Cancel Registration'}
    </button>
  );
}

export default function CancelRegistrationForm({ tournamentId, teamId }: { tournamentId: string, teamId?: string }) {
  return (
    <form action={cancelRegistration as any}>
      <input type="hidden" name="tournamentId" value={tournamentId} />
      {teamId && <input type="hidden" name="teamId" value={teamId} />}
      <CancelSubmitButton />
    </form>
  );
}
