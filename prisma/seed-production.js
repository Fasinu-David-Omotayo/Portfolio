// A one-command way to seed the production database, without any of the
// manual PowerShell environment-variable juggling that turned out to be
// so fragile (a stale value in one terminal window silently overriding
// values from a freshly-copied .env file, values getting corrupted by a
// line-break mid-paste, etc).
//
// This loads .env.production.local directly and explicitly - nothing
// relies on what happens to already be set in your terminal session.
//
// Usage:
//   vercel env pull .env.production.local --environment=production
//   npm run db:seed:prod
require('dotenv').config({ path: '.env.production.local' });
require('./seed.js');
