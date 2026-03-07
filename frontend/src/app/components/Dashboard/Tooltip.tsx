'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';

export default function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [showBelow, setShowBelow] = useState(false);

  const handleEnter = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setShowBelow(rect.top < 100);
  }, []);

  return (
    <span
      ref={triggerRef}
      className="group/tip relative inline-flex cursor-help"
      onMouseEnter={handleEnter}
    >
      {children}
      <span
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-[12px] font-normal normal-case tracking-normal leading-relaxed text-slate-200 opacity-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover/tip:opacity-100 ${
          showBelow ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
        }`}
        style={{ width: 'max-content', maxWidth: 280 }}
      >
        {text}
      </span>
    </span>
  );
}
