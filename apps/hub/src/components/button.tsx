'use client';
// When onClick returns a promise, the clicked button shows a spinner and ignores further clicks until it settles,
// so every async action gets instant feedback without each screen wiring its own state.
import { useRef, useState, type ComponentProps, type MouseEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BUTTON, cx, type ButtonVariant } from './variants';

type Props = Omit<ComponentProps<'button'>, 'onClick'> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => unknown;
};

export function Button({ variant = 'primary', size = 'md', className, loading, onClick, children, disabled, ...p }: Props) {
  const [pending, setPending] = useState(false);
  const alive = useRef(true);
  const busy = pending || !!loading;
  return (
    <button
      type="button"
      {...p}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={(e) => {
        const r = onClick?.(e);
        if (r && typeof (r as Promise<unknown>).then === 'function') {
          alive.current = true;
          setPending(true);
          (r as Promise<unknown>).finally(() => alive.current && setPending(false));
        }
      }}
      ref={(el) => {
        alive.current = !!el;
      }}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-[background-color,color,opacity,transform] duration-[120ms] ease-out active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:active:scale-100',
        busy && 'disabled:cursor-progress',
        size === 'md' ? 'min-h-11 rounded-md px-5 text-button-md' : 'min-h-10 rounded-sm px-3.5 text-button-sm',
        BUTTON[variant],
        className,
      )}
    >
      {busy && <LoaderCircle size={size === 'md' ? 18 : 16} strokeWidth={1.5} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
