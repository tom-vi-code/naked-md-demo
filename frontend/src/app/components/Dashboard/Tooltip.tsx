'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';

export default function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [showBelow, setShowBelow] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const [alignRight, setAlignRight] = useState(false);

  const handleEnter = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setShowBelow(rect.top < 100);
    setAlignLeft(rect.left < 140);
    setAlignRight(window.innerWidth - rect.right < 140);
  }, []);

  const positionClasses = alignLeft
    ? 'left-0 translate-x-0'
    : alignRight
      ? 'right-0 translate-x-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <span
      ref={triggerRef}
      className="group/tip relative inline-flex cursor-help"
      onMouseEnter={handleEnter}
    >
      {children}
      <span
        className={`pointer-events-none absolute z-50 rounded-none border border-white/10 bg-[#282828] px-3.5 py-2.5 text-[12px] font-normal normal-case tracking-normal leading-relaxed text-slate-200 opacity-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover/tip:opacity-100 ${positionClasses} ${
          showBelow ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
        }`}
        style={{ width: 'max-content', maxWidth: 280 }}
      >
        {text}
      </span>
    </span>
  );
}
