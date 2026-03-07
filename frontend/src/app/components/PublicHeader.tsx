'use client';

import Image from 'next/image';

interface PublicHeaderProps {
  compact?: boolean;
}

const NAV_LINKS = ['Locations', 'Services', 'Treatments', 'Results', 'About'];

export default function PublicHeader({ compact = false }: PublicHeaderProps) {
  return (
    <header className="relative z-20">
      <div className="bg-[#2d2d2d] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 text-[11px] uppercase tracking-[0.3em] sm:px-6 lg:px-8">
          <span className="font-bold text-white">You, but better.</span>
          <span className="hidden font-medium text-white/65 md:inline">
            Newport Beach · Beverly Hills · Scottsdale
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden border-b border-[#e7e7e7] bg-white text-[#151515]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/join" className="flex items-center gap-3.5">
            <Image
              src="/nmd-logo.svg"
              alt="NakedMD"
              width={85}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <div className="font-headline text-2xl uppercase tracking-[0.02em] leading-[0.9] text-[#151515]">
                NakedMD
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#717171]">
                Powered by Vi Operate
              </div>
            </div>
          </a>

          {!compact && (
            <nav className="hidden items-center gap-8 text-[13px] font-bold uppercase tracking-[0.04em] text-[#717171] xl:flex font-ui">
              {NAV_LINKS.map((link) => (
                <a key={link} href="/join#lead-form" className="transition-colors hover:text-[#151515]">
                  {link}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="hidden border border-[#dfdfdf] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#151515] hover:bg-[#151515] hover:text-white sm:inline-flex font-ui"
            >
              Dashboard
            </a>
            <a
              href="/join#lead-form"
              className="border border-[#dfdfdf] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#151515] hover:bg-[#151515] hover:text-white font-ui"
            >
              Free Consultation
            </a>
            {!compact && (
              <a
                href="/join#pricing"
                className="bg-[#151515] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white hover:bg-[#2d2d2d] font-ui"
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
