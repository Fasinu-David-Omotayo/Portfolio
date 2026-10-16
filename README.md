# Fasinu David Omotayo — Portfolio

A full-stack personal portfolio — software development, graphic design, and data
analysis, all in one site — with a secure admin dashboard to manage everything
(projects, skills, site text, images) without touching code.

> ## 📖 Read this first
> You don't need to know how any of this works to get the site running. Follow
> the **"Getting it running"** section below, in order, top to bottom. Every
> step says exactly what to type and where. If something errors, read the
> error message out loud to yourself slowly — it usually tells you exactly
> what's wrong (e.g. "command not found" means a step above was skipped).
>
> Three things before you touch anything:
> 1. **Don't skip steps.** Step 4 (the database) has to happen before step 6
>    (seeding it) — they're numbered for a reason.
> 2. **Never upload your `.env` file anywhere public.** See "Keeping your
>    secrets safe" below — this is the single most important section in this
>    README.
> 3. If you get stuck, copy the *exact* error message and ask for help with
>    it — don't paraphrase it.

---

## What's inside

- **Public site**: Hero (typewriter role cycle, stats, scrolling tech
  ticker, optional Download CV button), a filterable masonry Portfolio
  (Software Development / Graphic Design / Data Analysis, with a second row
  of sub-filters for Graphic Design, and a lightbox with an image gallery +
  an optional Problem/Approach/Result case-study breakdown), About (hover
  between a photo and an "art version" portrait), Skills (grouped by
  category), Testimonials, and Contact (form + social links). The nav is
  fixed with scroll-spy and an optional uploaded logo.
- **Admin dashboard** (`/admin`): add/edit/delete portfolio projects (with
  multi-image galleries and an optional case-study write-up), edit every
  piece of text on the public site including the nav logo, manage skills and
  testimonials, read contact messages, see visitor activity, and change your
  login email/password — all from a browser, no code required.
- Built with **Next.js 14, Prisma, PostgreSQL**, deployed on **Vercel**.

---

## Keeping your secrets safe

This project needs a few secret values to work (a database password, a login
password, etc.). Those live in a file called `.env`, which **you create
yourself** — it is never included in anything you download or push to GitHub
(it's listed in `.gitignore`, which tells Git to always ignore it).

**Rules to live by:**
- Never paste real values from your `.env` file into a chat, a GitHub issue,
  or a screenshot you share with anyone.
- Never remove `.env` from `.gitignore`.
- Before pushing to GitHub for the first time, double check it's being
  ignored:
  ```
  git check-ignore -v .env
  ```
  If that command prints a line of output, you're safe — Git is ignoring it.
  If it prints nothing, **stop** and make sure `.gitignore` is in your
  project's root folder (not inside a subfolder) before continuing.
- `.env.example` (committed to the repo) is just a template showing *which*
  values are needed — it contains no real secrets, only placeholders.

---

## Getting it running

### 1. Install Node.js
If you don't already have it: download and install the **LTS** version from
[nodejs.org](https://nodejs.org). Restart your terminal afterwards.

### 2. Open a terminal in this project folder
Make sure you're inside the folder that has `package.json` in it — if you run
`dir` (Windows) or `ls` (Mac/Linux) you should see `package.json` listed.

### 3. Install the project's dependencies
```
npm install
```
This downloads everything the project needs into a `node_modules` folder.
It can take a minute or two. **You will see a wall of `npm warn deprecated`
lines — that is normal and safe to ignore.** Those are warnings from
sub-dependencies of dependencies, not from this project, and they don't
affect anything. The only thing that matters is that the command finishes
without a red `npm ERR!` line.

### 4. Create a free database
This project uses PostgreSQL. The fastest free option is
[neon.tech](https://neon.tech) (no credit card needed):
1. Sign up, create a new project.
2. On the project dashboard, click **Connect**.
3. If there's a "Connection pooling" toggle, turn it **off**, then copy the
   connection string shown (it starts with `postgresql://`).

### 5. Create your `.env` file
In the project folder, copy `.env.example` to a new file named exactly `.env`:
```
cp .env.example .env        (Mac/Linux)
copy .env.example .env      (Windows)
```
Open `.env` in any text editor and fill in:
- `DATABASE_URL` — the connection string from step 4.
- `JWT_SECRET` — a long random string. Generate one by running:
  ```
  openssl rand -base64 32
  ```
  **If that command isn't recognized** (common on Windows), open **PowerShell**
  and run this instead:
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```
  Either way, copy the result into `JWT_SECRET="..."`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — the login you'll use for
  `/admin`. Pick a real password here, not the placeholder.
- Leave `BLOB_READ_WRITE_TOKEN` blank for now — see step 8.

### 6. Set up the database tables and your admin account

> ⚠️ **Run these as two separate commands, typed/pasted one at a time —
> never chain them on one line and never paste both at once.** A free Neon
> database falls asleep after a few minutes of inactivity, and the very
> first command you run against it can time out while it wakes up (see
> "DB cold start" in Troubleshooting below). If you chain the migrate and
> seed commands together, the seed command can end up racing ahead of a
> migration that silently failed — it finds your old admin account and
> looks like it worked, then fails later with a confusing "column does not
> exist" error. Running them separately, and simply re-running a command
> that times out, avoids this completely.

**If this is a brand-new database** (nothing set up yet):
```
npx prisma migrate dev --name init
```
Wait for it to finish and print `Your database is now in sync...` — **then**,
as a separate step, run:
```
npm run db:seed
```
The first command creates the tables in your database. The second creates
your admin login and a few sample projects/skills/testimonials you can
replace later.

**If you already set this project up before** (you already have an admin
login and some projects saved), your database is missing the newer tables —
`Testimonial`, plus the `logoUrl` field and the case-study fields
(`problem`/`approach`/`result`) on each project. Run this instead, and accept
the prompt (your existing data is kept — this only adds new columns/tables,
it doesn't touch what's already there):
```
npx prisma migrate dev --name add_testimonials_and_case_studies
```
You don't need to re-run `db:seed` in this case — your admin login and
existing projects are untouched.

### 7. Run it locally
```
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public site, and
[http://localhost:3000/admin](http://localhost:3000/admin) to log in (use the
email/password you put in `.env`).

### 8. Set up image storage (needed before going live)
Locally, uploaded images are saved to a folder on your computer — fine for
testing, but Vercel's servers don't keep files between requests, so uploads
would disappear in production. Fix this with a free Vercel Blob store:
1. On your Vercel dashboard: **Storage → Create Database → Blob**.
2. **Important:** when creating it, set access to **Public**, not Private —
   this project's upload code expects public image URLs. (A private store
   will cause uploads to fail with a "Cannot use public access on a private
   store" error.)
3. Copy the `BLOB_READ_WRITE_TOKEN` it gives you into both your local `.env`
   and your Vercel project's environment variables (step 9).

### 9. Deploy to Vercel
1. Push this project to a GitHub repository (your `.env` will **not** be
   included — see "Keeping your secrets safe" above).
2. On [vercel.com](https://vercel.com), import that repository.
3. In the project's **Settings → Environment Variables**, add every value
   from your `.env` file (same names, same values) — `DATABASE_URL`,
   `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, and
   `BLOB_READ_WRITE_TOKEN`.
   - **Do not** toggle any of them as "Sensitive". That hides the value from
     `vercel env pull` too (not just the dashboard), which breaks local
     tooling that needs the real value — it isn't needed for security here.
4. Click Deploy.
5. Once deployed, seed the production database **once**:
   ```
   npx vercel login
   npx vercel link
   npx vercel env pull .env.production.local --environment=production
   npm run db:seed:prod
   ```
6. Visit `your-site.vercel.app/admin` and log in. **Change your password
   immediately** from Settings — the one in `.env` was only ever meant for
   this first login.

---

## Before you consider this "live"

- [ ] Generated a real, random `JWT_SECRET` (not the placeholder).
- [ ] Logged in once and changed the admin password to something only you know.
- [ ] Vercel Blob store is set to **Public** access.
- [ ] Replaced the 3 sample projects and sample skills with real ones.
- [ ] Filled in your real bio, photo, and social links under Admin → Site
      Content.
- [ ] Confirmed `.env` was never committed to Git (`git check-ignore -v .env`
      should print a line — see above).

## Troubleshooting

**`Error: P1001: Can't reach database server` (DB cold start)**
Your free Neon database was asleep and hasn't finished waking up yet. This
almost always happens on the *first* command you run after some idle time.
Fix: just run the exact same command again. By the second try the database
is awake and it goes through. This is normal, not a sign anything is broken
— it is not a reason to try a different command or to chain commands
together (see the warning in step 6).

**`Error: P2022: The column ... does not exist`**
This means a migration didn't fully complete — almost always caused by
running `migrate dev` and `db:seed` chained together right after a cold
start (see above). Fix: run `npx prisma migrate dev` by itself again (no
`--name` needed if it's already been named once) and let it finish
completely before running `db:seed` as its own, separate command.

**`Environment variable not found: DATABASE_URL`**
You're running a command from a folder that doesn't have your `.env` file,
or step 5 was skipped. Make sure `.env` exists in the same folder as
`package.json` and that `DATABASE_URL` is filled in with a real connection
string (not the placeholder).

**A wall of `npm warn deprecated` lines during `npm install`**
Normal, see step 3 — not an error, safe to ignore.

**"Cannot use public access on a private store" when uploading an image**
Your Vercel Blob store was created as Private. Delete it and recreate it as
**Public** (see step 8) — this project's image URLs need to be publicly
reachable.

**CV upload asks for a URL instead of a file picker**
Make sure you're running the files from this delivery, not an older one —
the CV field under Admin → Site Content → Hero is a real
`<input type="file" accept="application/pdf">` that uploads straight from
your computer (via `/api/upload-document`), not a text box for a link.

## Project structure (if you want to look around)

```
src/app/              Pages (public site + admin) and API routes
src/components/       Public site sections (Nav, Hero, Portfolio, ...)
src/components/admin/ Admin dashboard pieces (WorksManager, ContentEditor, ...)
src/lib/              Shared server logic (auth, database, validation, ...)
prisma/schema.prisma  Database structure
prisma/seed.js        Creates your admin account + sample content
```

## A couple of deliberate design choices

- **One database, not two.** The exact same `DATABASE_URL` is used for local
  development and production — no separate "dev" and "prod" databases to keep
  in sync. Simpler to reason about for a one-person project; just be a little
  careful that local testing doesn't delete content you care about.
- **Images become WebP automatically.** Every upload is converted and resized
  (a full version + a thumbnail + a tiny blurred placeholder) so the site
  stays fast without you having to think about image optimization.
