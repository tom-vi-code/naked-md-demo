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
        'nmd-primary': '#151515',
        'nmd-hover': '#2d2d2d',
        'nmd-sand': '#f4f1ea',
        'nmd-cream': '#F4EEDA',
        'nmd-champagne': '#C4B59A',
        'nmd-border': '#e7e7e7',
        'bg-dashboard': '#151515',
        'text-dashboard': '#F0F0F5',
        'chat-agent-bg': '#F3F4F6',
      },
      fontFamily: {
        headline: ['League Gothic', 'sans-serif'],
        body: ['futura-pt', 'Inter', 'system-ui', 'sans-serif'],
        ui: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'futura-pt', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
};

export default config;
