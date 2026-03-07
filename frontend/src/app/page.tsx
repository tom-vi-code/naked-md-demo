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
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,165,114,0.22),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(53,18,74,0.85),transparent_38%)]" />
      <div className="absolute inset-0 opacity-60 nmd-hero-grid" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'surface-card-dark w-full max-w-md rounded-[32px] px-6 py-8 sm:px-8 sm:py-10',
            shaking && 'animate-shake',
          )}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/nmd-logo.png"
              alt="NakedMD"
              width={114}
              height={64}
              className="mb-5 h-16 w-auto drop-shadow-[0_20px_48px_rgba(197,165,114,0.35)]"
            />
            <span className="mb-3 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              Newport Beach
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Manager Dashboard
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Review leads, call outcomes, and conversion performance across all NakedMD
              locations.
            </p>
          </div>

          <div className="mb-4 rounded-[22px] border border-white/8 bg-white/4 p-4">
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
                'w-full rounded-2xl border bg-[#12121f] px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-[#C5A572]',
                error ? 'border-red-400/75' : 'border-white/10',
              )}
            />
            <div className="mt-2 min-h-5 text-sm text-red-300">
              {error ? 'Incorrect password. Please try again.' : ''}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#C5A572_0%,#B8944A_100%)] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_38px_rgba(197,165,114,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign In
          </button>

          <div className="mt-6 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>No white-label clutter</span>
            <span>Dark analytics theme</span>
          </div>
        </form>
      </div>
    </main>
  );
}
