// Shared class helpers for ui.tsx and button.tsx (kept apart to avoid an import cycle).
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-primary' | 'danger';
export const BUTTON: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-dark active:bg-primary-dark',
  secondary: 'border border-hairline-strong bg-canvas-white text-ink hover:border-ink-subtle hover:bg-canvas',
  ghost: 'bg-transparent text-ink hover:bg-canvas-section',
  'ghost-primary': 'bg-transparent text-primary hover:bg-primary-light',
  danger: 'bg-error text-on-primary hover:opacity-90',
};

/** Small two-line wordmark beside the logo mark (DESIGN.md 3: thin uppercase line over bold NEXTURE). */
export const WORDMARK = {
  top: 'block text-[10px] font-light uppercase leading-none tracking-[0.28em]',
  bottom: 'block text-[17px] font-bold uppercase leading-tight tracking-[0.04em]',
};
