'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PublicHeaderProps {
  compact?: boolean;
}

const NAV_LINKS = ['Locations', 'Services', 'Treatments', 'Results', 'About'];

export default function PublicHeader({ compact = false }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <a href="/join" className="flex items-center gap-2">
            <Image
              src="/nmd-logo-dark.png"
              alt="NakedMD"
              width={140}
              height={33}
              className="h-8 w-auto"
            />
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C4B59A] border-l border-[#E0DEDB] pl-2 ml-1">
              Powered by Vi
            </span>
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
              className="hidden border border-[#dfdfdf] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#151515] hover:bg-[#151515] hover:text-white xl:inline-flex font-ui"
            >
              Free Consultation
            </a>
            {!compact && (
              <a
                href="/join#pricing"
                className="hidden bg-[#151515] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white hover:bg-[#2d2d2d] xl:inline-flex font-ui"
              >
                Book Now
              </a>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex items-center justify-center border border-[#dfdfdf] bg-white p-2.5 text-[#151515] xl:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-[#2d2d2d] bg-[#151515] text-white xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
            {!compact &&
              NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="/join#lead-form"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-white/10 py-3 text-[13px] font-bold uppercase tracking-[0.04em] text-white/80 hover:text-white font-ui"
                >
                  {link}
                </a>
              ))}
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 block w-full border border-white/20 bg-transparent px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white hover:bg-white/10 font-ui"
            >
              Dashboard
            </a>
            <a
              href="/join#lead-form"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 block w-full border border-white/20 bg-transparent px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-white hover:bg-white/10 font-ui"
            >
              Free Consultation
            </a>
            {!compact && (
              <a
                href="/join#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block w-full bg-[#f4f1ea] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.04em] text-[#151515] hover:bg-[#C4B59A] font-ui"
              >
                Book Now
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
