import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nmd-teal': '#1F8A84',
        'nmd-teal-dark': '#187F80',
        'nmd-button-dark': '#166f6b',
        'bg-dashboard': '#1a1a1a',
        'text-dashboard': '#F0F0F5',
        'chat-agent-bg': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
