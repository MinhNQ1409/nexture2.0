// Minimal primitives on design tokens; replaced by shadcn/ui components once the brand is set.
import type { ComponentProps } from 'react';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export function Button({ variant = 'primary', className, ...p }: ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  return (
    <button
      {...p}
      className={cx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variant === 'primary' && 'bg-brand text-on-brand hover:bg-brand-hover',
        variant === 'secondary' && 'border border-border bg-surface text-text hover:bg-surface-muted',
        variant === 'danger' && 'bg-danger text-on-brand hover:opacity-90',
        className,
      )}
    />
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-text-muted">{hint}</span>}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Input({ className, ...p }: ComponentProps<'input'>) {
  return <input {...p} className={cx('w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm', className)} />;
}

export function Select({ className, ...p }: ComponentProps<'select'>) {
  return <select {...p} className={cx('w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm', className)} />;
}

export function Textarea({ className, ...p }: ComponentProps<'textarea'>) {
  return <textarea {...p} className={cx('w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm', className)} />;
}

export function Card({ className, ...p }: ComponentProps<'div'>) {
  return <div {...p} className={cx('rounded-md border border-border bg-surface p-6 shadow-sm', className)} />;
}

export function Alert({ tone = 'danger', children }: { tone?: 'danger' | 'success'; children: React.ReactNode }) {
  return <p className={cx('rounded-sm px-3 py-2 text-sm', tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success')}>{children}</p>;
}
