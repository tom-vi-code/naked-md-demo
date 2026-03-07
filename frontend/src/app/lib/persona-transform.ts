import type { AgentPersona, ChatMessage } from './types';

// ---------------------------------------------------------------------------
// Tone-transform pipeline
// Applies persona settings to a ChatMessage produced by the concierge engine.
// ---------------------------------------------------------------------------

const WARM_OPENERS = [
  'Love that question!',
  'Great question!',
  'Happy to help with that!',
  'Glad you asked!',
  'Oh, good one!',
];

const HIGH_ENERGY_TAGS = [
  "Let's go!",
  "You're going to love this!",
  "This is the fun part!",
  "Here's the exciting bit!",
];

const HUMOR_ASIDES = [
  '(No pressure, just results.)',
  '(We promise, it is easier than you think.)',
  '(Zero judgment, maximum glow.)',
  '(We keep it real.)',
  '(Spoiler: it is worth it.)',
];

const FORMAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bI would\b/g, 'I would recommend'],
  [/\bYou got it\b/g, 'Absolutely'],
  [/\bgot you covered\b/g, 'have you covered'],
  [/\bsuper\b/gi, 'excellent'],
];

const CASUAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bAbsolutely\b/g, 'Totally'],
  [/\bI would recommend\b/g, "I'd say"],
  [/\bdo not\b/g, "don't"],
  [/\bwill not\b/g, "won't"],
  [/\bcannot\b/g, "can't"],
  [/\bis not\b/g, "isn't"],
  [/\bare not\b/g, "aren't"],
];

const EMOJI_MAP: Record<string, string> = {
  pricing: '\uD83D\uDCB0',
  services: '\u2728',
  hours: '\u23F0',
  consultation: '\uD83D\uDCCB',
  'first-visit': '\u2705',
  treatments: '\u2728',
  injectables: '\uD83D\uDC89',
  offer: '\uD83C\uDF9F\uFE0F',
  recommendation: '\u2B50',
  compare: '\uD83D\uDD0D',
  location: '\uD83D\uDCCD',
  greeting: '\uD83D\uDC4B',
  thanks: '\uD83D\uDE4F',
};

// Simple translations for demo purposes (key phrases only)
const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    'Hey': 'Hola',
    'Absolutely': 'Por supuesto',
    'Great question': 'Gran pregunta',
    'Happy to help': 'Encantado de ayudar',
    'You got it': 'Entendido',
    'your': 'tu',
    'is set': 'esta listo',
    'I can help': 'Puedo ayudar',
    'Best fit': 'Mejor opcion',
    'Walk-in consultations are available': 'Las consultas sin cita estan disponibles',
    'Bring a valid photo ID': 'Traiga una identificacion con foto valida',
  },
  fr: {
    'Hey': 'Salut',
    'Absolutely': 'Absolument',
    'Great question': 'Excellente question',
    'Happy to help': 'Ravi de vous aider',
    'You got it': 'Compris',
    'is set': 'est pret',
    'I can help': 'Je peux aider',
    'Best fit': 'Meilleur choix',
  },
  pt: {
    'Hey': 'Ola',
    'Absolutely': 'Com certeza',
    'Great question': 'Otima pergunta',
    'Happy to help': 'Feliz em ajudar',
    'You got it': 'Entendido',
    'is set': 'esta pronto',
    'I can help': 'Posso ajudar',
  },
  de: {
    'Hey': 'Hallo',
    'Absolutely': 'Auf jeden Fall',
    'Great question': 'Tolle Frage',
    'Happy to help': 'Gerne behilflich',
    'You got it': 'Verstanden',
    'is set': 'ist bereit',
    'I can help': 'Ich kann helfen',
  },
  zh: {
    'Hey': '\u4F60\u597D',
    'Absolutely': '\u5F53\u7136',
    'Great question': '\u597D\u95EE\u9898',
    'Happy to help': '\u5F88\u9AD8\u5174\u5E2E\u52A9\u4F60',
    'You got it': '\u6536\u5230',
  },
  ko: {
    'Hey': '\uC548\uB155\uD558\uC138\uC694',
    'Absolutely': '\uBB3C\uB860\uC774\uC8E0',
    'Great question': '\uC88B\uC740 \uC9C8\uBB38\uC774\uC5D0\uC694',
    'Happy to help': '\uB3C4\uC640\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4',
    'You got it': '\uC54C\uACA0\uC2B5\uB2C8\uB2E4',
  },
  ja: {
    'Hey': '\u3053\u3093\u306B\u3061\u306F',
    'Absolutely': '\u3082\u3061\u308D\u3093',
    'Great question': '\u3044\u3044\u8CEA\u554F\u3067\u3059\u306D',
    'Happy to help': '\u304A\u624B\u4F1D\u3044\u3057\u307E\u3059',
    'You got it': '\u627F\u77E5\u3057\u307E\u3057\u305F',
  },
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyWarmth(text: string, level: number): string {
  if (level < 50) return text;
  const opener = pick(WARM_OPENERS);
  // Only prepend if not already starting with a warm phrase
  if (WARM_OPENERS.some((w) => text.startsWith(w))) return text;
  return level > 75 ? `${opener} ${text}` : text;
}

function applyEnergy(text: string, level: number): string {
  if (level < 60) return text;
  const tag = pick(HIGH_ENERGY_TAGS);
  if (level > 80) return `${text} ${tag}`;
  // Moderate energy: replace first sentence-ending period (not decimals like $9.99)
  return text.replace(/(?<=[a-zA-Z])\.(?=\s|$)/, '!');
}

function applyHumor(text: string, level: number): string {
  if (level < 40) return text;
  const aside = pick(HUMOR_ASIDES);
  if (level > 70) return `${text} ${aside}`;
  return text;
}

function applyFormality(text: string, level: number): string {
  if (level > 65) {
    for (const [pattern, replacement] of FORMAL_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
  } else if (level < 35) {
    for (const [pattern, replacement] of CASUAL_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
  }
  return text;
}

function applyEmoji(text: string, intent?: string): string {
  const emoji = (intent && EMOJI_MAP[intent]) || '\u2728';
  return `${emoji} ${text}`;
}

function applyLanguage(text: string, lang: string): string {
  if (lang === 'en') return text;
  const dict = TRANSLATIONS[lang];
  if (!dict) return text;
  let result = text;
  for (const [en, translated] of Object.entries(dict)) {
    result = result.replace(new RegExp(en, 'g'), translated);
  }
  return result;
}

function applyName(text: string, defaultName: string, customName: string): string {
  if (!customName || customName === defaultName) return text;
  return text.replace(
    new RegExp(`\\b${escapeRegex(defaultName)}\\b`, 'g'),
    () => customName,
  );
}

function applyGreeting(text: string, greeting: string, isWelcome: boolean): string {
  if (!greeting || !isWelcome) return text;
  // Replace the first sentence with the custom greeting
  const firstDash = text.indexOf(' - ');
  if (firstDash > -1) {
    return `${greeting} - ${text.slice(firstDash + 3)}`;
  }
  return `${greeting} ${text}`;
}

function applySignoff(text: string, signoff: string): string {
  if (!signoff) return text;
  return `${text} ${signoff}`;
}

export function transformMessage(
  msg: ChatMessage,
  persona: AgentPersona,
  intent?: string,
  isWelcome = false,
): ChatMessage {
  let content = msg.content;

  // Order matters: name first, then tone, then language last
  content = applyName(content, 'Vi', persona.name);
  content = applyGreeting(content, persona.greeting, isWelcome);
  content = applyWarmth(content, persona.warmth);
  content = applyFormality(content, persona.formality);
  content = applyEnergy(content, persona.energy);
  content = applyHumor(content, persona.humor);
  if (persona.useEmoji) {
    content = applyEmoji(content, intent);
  }
  content = applySignoff(content, persona.signoff);
  content = applyLanguage(content, persona.language);

  return { ...msg, content };
}
