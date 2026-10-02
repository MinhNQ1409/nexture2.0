'use client';
// Rich-text editor (TipTap). Only produces tags the server allowlist keeps (core/content/html.ts):
// p, h2, h3, strong, em, u, a, ul, ol, li, blockquote, br.
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useId } from 'react';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2, type LucideIcon } from 'lucide-react';
import { cx } from './ui';

/** Typography for stored rich text, shared by the editor and read views. */
export const proseClass =
  'flex flex-col gap-3 text-body-md [&_a]:text-link [&_a]:underline [&_h2]:text-heading-md [&_h3]:text-heading-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li>p]:inline [&_blockquote]:border-l-4 [&_blockquote]:border-hairline-strong [&_blockquote]:pl-4 [&_blockquote]:text-ink-mute';

export function RichText({ label, value, onChange, hint, error, minRows = 6 }: { label: string; value: string; onChange: (html: string) => void; hint?: string; error?: string; minRows?: number }) {
  const id = useId();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'], HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        id,
        'aria-label': label,
        class: cx(proseClass, 'min-h-[var(--rt-min)] px-3 py-2.5 outline-none'),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Keep the editor in step when the form is reset from outside (after save).
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  return (
    <div>
      <label htmlFor={id} className="block pb-1 text-body-md font-semibold">
        {label}
      </label>
      <div
        className={cx('rounded-md border bg-canvas-white focus-within:border-primary', error ? 'border-error' : 'border-hairline')}
        style={{ ['--rt-min' as string]: `${minRows * 1.6}em` }}
      >
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {hint && !error && <span className="block pt-1 text-caption text-ink-mute">{hint}</span>}
      {error && <span className="block pt-1 text-caption text-error">{error}</span>}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const btn = (Icon: LucideIcon, title: string, active: boolean, run: () => void, disabled = false) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={!editor || disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      className={cx('rounded-sm p-1.5 hover:bg-canvas-section disabled:opacity-40', active ? 'bg-primary-light text-primary' : 'text-ink-mute')}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
    </button>
  );
  const c = () => editor!.chain().focus();
  const is = (name: string, attrs?: Record<string, unknown>) => Boolean(editor?.isActive(name, attrs));
  function link() {
    const prev = editor!.getAttributes('link').href as string | undefined;
    const url = prompt('Địa chỉ liên kết (để trống để gỡ):', prev ?? 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') c().extendMarkRange('link').unsetLink().run();
    else c().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }
  return (
    <div role="toolbar" aria-label="Định dạng" className="flex flex-wrap gap-0.5 border-b border-hairline px-1.5 py-1">
      {btn(Bold, 'In đậm', is('bold'), () => c().toggleBold().run())}
      {btn(Italic, 'In nghiêng', is('italic'), () => c().toggleItalic().run())}
      {btn(Underline, 'Gạch chân', is('underline'), () => c().toggleUnderline().run())}
      <span className="mx-1 w-px bg-hairline" aria-hidden />
      {btn(Heading2, 'Tiêu đề lớn', is('heading', { level: 2 }), () => c().toggleHeading({ level: 2 }).run())}
      {btn(Heading3, 'Tiêu đề nhỏ', is('heading', { level: 3 }), () => c().toggleHeading({ level: 3 }).run())}
      {btn(List, 'Danh sách', is('bulletList'), () => c().toggleBulletList().run())}
      {btn(ListOrdered, 'Danh sách đánh số', is('orderedList'), () => c().toggleOrderedList().run())}
      {btn(Quote, 'Trích dẫn', is('blockquote'), () => c().toggleBlockquote().run())}
      {btn(Link2, 'Liên kết', is('link'), link)}
      <span className="mx-1 w-px bg-hairline" aria-hidden />
      {btn(Undo2, 'Hoàn tác', false, () => c().undo().run(), !editor?.can().undo())}
      {btn(Redo2, 'Làm lại', false, () => c().redo().run(), !editor?.can().redo())}
    </div>
  );
}
