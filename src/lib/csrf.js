// sameSite=strict on the session cookie already blocks the cookie from
// being sent on cross-site requests, which is the main CSRF defense. This
// adds a second, independent layer: reject any state-changing request
// whose Origin header doesn't match the site's own host. Belt and braces -
// if one mechanism has a gap (e.g. an older browser, a misconfigured
// proxy), the other still holds.
export function isSameOrigin(request) {
  const origin = request.headers.get('origin');

  // Some legitimate same-site requests (plain top-level navigations,
  // certain older browsers) don't send an Origin header at all. The
  // sameSite cookie setting already covers those cases, so we don't block
  // on absence - only on a mismatch, which is unambiguous evidence of a
  // cross-site request.
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get('host');
    return originHost === requestHost;
  } catch {
    return false;
  }
}
