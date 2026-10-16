import { prisma } from './db';

// SiteContent is a singleton (always id: 1). This helper fetches it, and
// transparently creates the default row the very first time it's needed -
// so there's no separate "run this migration/seed step" requirement for it.
//
// Uses upsert (not findUnique-then-create) so two requests arriving at the
// same instant - which happens routinely right after a dev-server reload,
// and can happen in production too - can't both see "no row yet" and both
// try to insert id:1. upsert is a single atomic database operation: the
// second request just lands on the "update" branch (with no fields to
// change) instead of throwing a unique-constraint error.
export async function getSiteContent() {
  return prisma.siteContent.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}