// Whitelist of what may reach schema atlas: docs/spec/08-cong-khai.md §3. A test compares this with the projection.
export const PUBLIC_ENTITY_COLUMNS = [
  'id',
  'entityType',
  'slug',
  'orgId',
  'companySlug',
  'companyName',
  'title',
  'subtitle',
  'summary',
  'bodyHtml',
  'extra',
  'sortDate',
  'datePrecision',
  'endDate',
  'endDatePrecision',
  'coverUrl',
  'coverAlt',
  'sources',
  'publishedAt',
  'updatedAt',
  'searchText',
  'en',
] as const;

export const PUBLIC_EVENT_EXTRA_KEYS = ['values', 'eventType'] as const;
export const PUBLIC_EXTRA_KEYS = {
  STORY: ['values'],
  EVENT: PUBLIC_EVENT_EXTRA_KEYS,
  PERSON: ['isFounder', 'contributionsHtml'],
  PRODUCT_PROJECT: ['status'],
} as const;
