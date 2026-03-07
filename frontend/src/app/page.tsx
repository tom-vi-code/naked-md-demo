'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        return;
      }
    } catch {
      // fall through to error state
    }

    setError(true);
    setShaking(true);
    window.setTimeout(() => setShaking(false), 420);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#151515] text-white">
      <div className="absolute inset-0 opacity-60 nmd-hero-grid" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'surface-card-dark w-full max-w-md px-6 py-8 sm:px-8 sm:py-10',
            shaking && 'animate-shake',
          )}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/nmd-logo-white.png"
              alt="NakedMD"
              width={114}
              height={64}
              className="mb-5 h-16 w-auto"
            />
            <span className="mb-3 border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              Newport Beach
            </span>
            <h1 className="font-headline text-2xl uppercase tracking-[0.02em] leading-[0.9] text-white sm:text-4xl">
              Manager Dashboard
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Review leads, call outcomes, and conversion performance across all NakedMD
              locations.
            </p>
          </div>

          <div className="mb-4 border border-white/8 bg-white/4 p-4">
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter dashboard password"
              autoFocus
              aria-invalid={error}
              className={cn(
                'w-full border bg-[#1e1e1e] px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-[#4C4C4B]',
                error ? 'border-red-400/75' : 'border-white/10',
              )}
            />
            <div className="mt-2 min-h-5 text-sm text-red-300">
              {error ? 'Incorrect password. Please try again.' : ''}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f4f1ea] px-5 py-4 text-[15px] font-bold uppercase tracking-[0.04em] text-[#151515] hover:bg-[#C4B59A] active:translate-y-0 font-ui"
          >
            Sign In
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>No white-label clutter</span>
            <span>Dark analytics theme</span>
          </div>
        </form>
      </div>
    </main>
  );
}
