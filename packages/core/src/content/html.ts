// Rich-text sanitising: docs/spec/02-database-ghi-chu.md §5.
import sanitizeHtml from 'sanitize-html';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'br'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }) },
};

/** Sanitised HTML, or null when nothing readable is left. */
export function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const out = sanitizeHtml(html, OPTIONS).trim();
  const text = out.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text ? out : null;
}
