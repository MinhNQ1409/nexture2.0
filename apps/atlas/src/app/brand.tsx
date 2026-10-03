// NexTure logo lockup: the mark plus a two-line wordmark. `onDark` swaps to the light mark for dark surfaces.
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const WORDMARK = {
  top: 'block text-[10px] font-light uppercase leading-none tracking-[0.28em]',
  bottom: 'block text-[17px] font-bold uppercase leading-tight tracking-[0.04em]',
};

export function BrandLockup({ sub, onDark, hideText, className }: { sub: string; onDark?: boolean; hideText?: string; className?: string }) {
  return (
    <span className={cx('flex items-center gap-3', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={onDark ? '/brand/nexture-mark-light.png' : '/brand/nexture-mark.png'} alt="" width={22} height={32} className="h-8 w-auto shrink-0" />
      <span className={cx(onDark ? 'text-on-dark' : 'text-ink', hideText)}>
        <span className={WORDMARK.top}>{sub}</span>
        <span className={WORDMARK.bottom}>NexTure</span>
      </span>
    </span>
  );
}
