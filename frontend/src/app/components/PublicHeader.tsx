'use client';

import Image from 'next/image';

interface PublicHeaderProps {
  compact?: boolean;
}

const NAV_LINKS = ['Locations', 'Services', 'Treatments', 'Results', 'About'];

export default function PublicHeader({ compact = false }: PublicHeaderProps) {
  return (
    <header className="relative z-20">
      <div className="bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.3em] sm:px-6 lg:px-8">
          <span className="font-bold text-white">You, but better.</span>
          <span className="hidden font-medium text-white/65 md:inline">
            Newport Beach · Beverly Hills · Scottsdale
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(120deg,#0a0012_0%,#21002e_42%,#35124a_100%)] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/join" className="flex items-center gap-3.5">
            <Image
              src="/nmd-logo.png"
              alt="NakedMD"
              width={85}
              height={48}
              className="h-12 w-auto drop-shadow-[0_12px_28px_rgba(197,165,114,0.35)]"
            />
            <div>
              <div className="text-xl font-black tracking-[0.06em] text-white">
                NakedMD
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                Powered by Vi Operate
              </div>
            </div>
          </a>

          {!compact && (
            <nav className="hidden items-center gap-8 text-[13px] font-bold uppercase tracking-[0.16em] text-white/80 xl:flex">
              {NAV_LINKS.map((link) => (
                <a key={link} href="/join#lead-form" className="transition-colors hover:text-white">
                  {link}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="hidden rounded-full border border-white/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 hover:border-white/35 hover:bg-white/8 hover:text-white sm:inline-flex"
            >
              Dashboard
            </a>
            <a
              href="/join#lead-form"
              className="rounded-full border border-white/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 hover:border-white/35 hover:bg-white/8 hover:text-white"
            >
              Free Consultation
            </a>
            {!compact && (
              <a
                href="/join#pricing"
                className="rounded-full bg-[linear-gradient(135deg,#C5A572_0%,#B8944A_100%)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(197,165,114,0.35)] hover:scale-[1.02]"
              >
                Book Now
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
