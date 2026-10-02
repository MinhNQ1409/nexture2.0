// Shared class helpers for ui.tsx and button.tsx (kept apart to avoid an import cycle).
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-primary' | 'danger';
export const BUTTON: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-dark active:bg-primary-dark',
  secondary: 'bg-primary-light text-primary-dark hover:bg-canvas-section',
  ghost: 'bg-transparent text-ink hover:bg-canvas-section',
  'ghost-primary': 'bg-transparent text-primary hover:bg-primary-light',
  danger: 'bg-error text-on-primary hover:opacity-90',
};
