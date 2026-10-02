// Primitives built strictly from DESIGN.md component tokens (button-*, text-input, card-*, badge-*, table-*).
import type { ComponentProps } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

import { BUTTON, cx, type ButtonVariant } from './variants';
import { Button } from './button';

export { Button, cx };
export type { ButtonVariant };

/** Button look for a <Link>. */
export const linkButton = (variant: ButtonVariant = 'primary') =>
  cx('inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md px-5 text-button-md transition-colors duration-[120ms] ease-out', BUTTON[variant]);

const control =
  'w-full rounded-md border border-hairline bg-canvas-white px-3 py-2.5 text-body-md text-ink disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-error';

export function Input({ className, ...p }: ComponentProps<'input'>) {
  return <input {...p} className={cx(control, className)} />;
}
export function Select({ className, ...p }: ComponentProps<'select'>) {
  return <select {...p} className={cx(control, 'pr-8', className)} />;
}
export function Textarea({ className, ...p }: ComponentProps<'textarea'>) {
  return <textarea {...p} className={cx(control, className)} />;
}

export function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block pb-1 text-body-md font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="block pt-1 text-caption text-ink-mute">{hint}</span>}
      {error && <span className="block pt-1 text-caption text-error">{error}</span>}
    </label>
  );
}

/** card-default; `section` = card-section (nested), `welcome` = card-welcome (one per page). */
export function Card({ section, welcome, className, ...p }: ComponentProps<'div'> & { section?: boolean; welcome?: boolean }) {
  return (
    <div
      {...p}
      className={cx(
        welcome ? 'rounded-xl p-6 md:p-8' : 'rounded-lg p-5',
        section ? 'bg-canvas-section' : 'border border-hairline bg-canvas-white shadow-card',
        className,
      )}
    />
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success'; children: React.ReactNode }) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={cx('flex items-start gap-2 rounded-md px-3 py-2.5 text-body-md', tone === 'error' ? 'bg-error-bg text-error' : 'bg-success-bg text-success')}>
      <Icon size={20} strokeWidth={1.5} className="shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

type BadgeTone = 'success' | 'error' | 'warning' | 'info' | 'neutral';
const BADGE: Record<BadgeTone, string> = {
  success: 'bg-success-bg text-success',
  error: 'bg-error-bg text-error',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  neutral: 'bg-canvas-section text-ink-mute',
};
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return <span className={cx('inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-pill px-2.5 py-0.5 text-caption', BADGE[tone])}>{children}</span>;
}

/** Page header of a management screen: title, description, primary action. */
export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-display-md">{title}</h1>
        {description && <p className="mt-1 text-body-md text-ink-mute">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const tableHead = 'bg-canvas-section text-left text-body-md font-semibold [&_th]:border-b [&_th]:border-hairline-strong [&_th]:px-4 [&_th]:py-3';
export const tableRow = 'border-b border-hairline bg-canvas-white transition-colors hover:bg-primary-light [&_td]:px-4 [&_td]:py-3';

/** Centered modal; closes on backdrop click. */
export function Dialog({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx('flex max-h-[90vh] w-full flex-col gap-4 rounded-xl bg-canvas-white p-5 shadow-card', wide ? 'max-w-5xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-heading-md">{title}</h2>
          <Button variant="ghost" size="sm" aria-label="Đóng" onClick={onClose}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
