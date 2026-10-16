// Single source of truth for the Graphic Design sub-categories - these
// only apply to works with type "design" (see schema.prisma). Clicking
// the "Graphic Design" top-level filter on the public site reveals these
// as a second row of filter buttons. This is the ONLY place that needs
// editing to add, rename, or remove one - the admin upload/edit form, the
// API's validation, and the public gallery's sub-filter buttons all read
// from this same list, so nothing gets out of sync.
//
// `value` is what's stored in the database (keep it short, lowercase,
// no spaces - safe to use in URLs and code). `label` is what people see.
//
// To add a category: add one line below, save, restart the dev server
// (or redeploy). No database migration needed - category is stored as
// plain text, not a fixed database enum.
export const CATEGORIES = [
  { value: 'brand', label: 'Brand Designs' },
  { value: 'logo', label: 'Logo Designs' },
  { value: 'flyer', label: 'Fliers & Posters' },
  { value: 'print', label: 'Print' },
  { value: 'mockup', label: 'Mockup Design' },
  { value: 'news', label: 'News Design' },
  { value: 'web3', label: 'Web3' },
  { value: 'ui', label: 'UI Design' },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);
