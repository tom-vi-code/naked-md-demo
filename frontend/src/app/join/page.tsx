'use client';

import { useState } from 'react';
import LeadForm from '@/app/components/LeadForm';
import WebChat from '@/app/components/WebChat';
import { LeadContext } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';

export default function JoinPage() {
  const [showChat, setShowChat] = useState(false);
  const [leadContext, setLeadContext] = useState<LeadContext | null>(null);

  function handleFormSubmit(context: LeadContext) {
    setLeadContext(context);
    requestAnimationFrame(() => {
      setShowChat(true);
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        aria-hidden={showChat}
        className={cn(
          'transition-all duration-500 ease-out',
          showChat ? 'pointer-events-none -translate-y-6 opacity-0 scale-[0.985]' : 'opacity-100',
        )}
      >
        <LeadForm onSubmit={handleFormSubmit} />
      </div>

      {leadContext && (
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out',
            showChat
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-8 opacity-0',
          )}
        >
          <WebChat leadContext={leadContext} />
        </div>
      )}
    </div>
  );
}
