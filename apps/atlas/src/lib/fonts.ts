import { Inter } from 'next/font/google';

// DESIGN.md 5: Inter for everything; headings use weight 600–700, uppercase only for small labels.
export const body = Inter({ subsets: ['vietnamese', 'latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap', variable: '--font-inter' });
export const fontVars = body.variable;
