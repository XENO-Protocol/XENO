import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { extend: { animation: { pulse: 'pulse 8s ease-in-out infinite' }, keyframes: { pulse: { '0%, 100%': { opacity: '0.03' }, '50%': { opacity: '0.06' } } } } },
  plugins: [],
};
export default config;