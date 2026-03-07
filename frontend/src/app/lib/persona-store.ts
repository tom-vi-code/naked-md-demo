import { DEFAULT_PERSONA, LANGUAGES } from './constants';
import type { AgentPersona, ResponseStyle } from './types';

let persona: AgentPersona = { ...DEFAULT_PERSONA };

const VALID_STYLES: ResponseStyle[] = ['concise', 'detailed', 'conversational'];
const VALID_LANGUAGES: string[] = LANGUAGES.map((l) => l.value);

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : fallback;
  return Math.max(min, Math.min(max, n));
}

function sanitize(raw: Record<string, unknown>): Partial<AgentPersona> {
  const clean: Partial<AgentPersona> = {};

  if ('name' in raw && typeof raw.name === 'string') {
    clean.name = raw.name.slice(0, 40) || DEFAULT_PERSONA.name;
  }
  if ('language' in raw && typeof raw.language === 'string') {
    clean.language = VALID_LANGUAGES.includes(raw.language) ? raw.language : persona.language;
  }
  if ('warmth' in raw) clean.warmth = clamp(raw.warmth, 0, 100, persona.warmth);
  if ('humor' in raw) clean.humor = clamp(raw.humor, 0, 100, persona.humor);
  if ('energy' in raw) clean.energy = clamp(raw.energy, 0, 100, persona.energy);
  if ('formality' in raw) clean.formality = clamp(raw.formality, 0, 100, persona.formality);
  if ('greeting' in raw && typeof raw.greeting === 'string') {
    clean.greeting = raw.greeting.slice(0, 200);
  }
  if ('signoff' in raw && typeof raw.signoff === 'string') {
    clean.signoff = raw.signoff.slice(0, 200);
  }
  if ('useEmoji' in raw && typeof raw.useEmoji === 'boolean') {
    clean.useEmoji = raw.useEmoji;
  }
  if ('style' in raw && typeof raw.style === 'string' && VALID_STYLES.includes(raw.style as ResponseStyle)) {
    clean.style = raw.style as ResponseStyle;
  }

  return clean;
}

export function getPersona(): AgentPersona {
  return { ...persona };
}

export function setPersona(raw: Record<string, unknown>): AgentPersona {
  persona = { ...persona, ...sanitize(raw) };
  return { ...persona };
}

export function resetPersona(): AgentPersona {
  persona = { ...DEFAULT_PERSONA };
  return { ...persona };
}
