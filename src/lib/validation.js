// Shared validators used by any route that accepts a URL from the admin.

// Images should only ever come from our own upload pipeline (local
// /uploads, bundled /images, or our Vercel Blob store) - never an
// arbitrary attacker-supplied URL, even though only an authenticated admin
// can reach these routes in the first place. Defense-in-depth against a
// stolen session.
export function isValidImageUrl(url) {
  if (typeof url !== 'string') return false;
  return (
    url.startsWith('/uploads/') ||
    url.startsWith('/images/') ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url)
  );
}

// Same storage locations as images (local /uploads, or our Vercel Blob
// store) - used for non-image uploads like the CV PDF, which come from
// /api/upload-document rather than /api/upload but land in the same two
// places. Locally that's a relative /uploads/... path, not a full URL, so
// this must NOT be validated with isSafeHttpUrl below (that's for
// hand-typed social links, which are always full external URLs).
export function isValidUploadUrl(url) {
  return isValidImageUrl(url);
}

// Social links get rendered directly as href attributes on the public
// site. Without this check, a "javascript:" or "data:" value saved here
// would run in every visitor's browser the moment they clicked the link -
// so URLs are restricted to http(s) only, no exceptions.
export function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}