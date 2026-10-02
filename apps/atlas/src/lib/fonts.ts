import { Be_Vietnam_Pro, Inter } from 'next/font/google';

// DESIGN.md: Be Vietnam Pro for headings/display (600, 700), Inter for body and UI (400, 600).
export const display = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['600', '700'], display: 'swap', variable: '--font-be-vietnam' });
export const body = Inter({ subsets: ['vietnamese', 'latin'], weight: ['400', '600'], display: 'swap', variable: '--font-inter' });
export const fontVars = `${display.variable} ${body.variable}`;
