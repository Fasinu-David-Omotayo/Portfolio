-- Work labelling and an optional extra link
ALTER TABLE "Work" ADD COLUMN "kind" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Work" ADD COLUMN "kindNote" TEXT;
ALTER TABLE "Work" ADD COLUMN "extraUrl" TEXT;
ALTER TABLE "Work" ADD COLUMN "extraLabel" TEXT;

-- Editable hero headline, stat tiles and a third About paragraph
ALTER TABLE "SiteContent" ADD COLUMN "heroHeadline" TEXT NOT NULL DEFAULT 'Software developer, data analyst and designer based in Lagos.';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat1Num" TEXT NOT NULL DEFAULT 'First Class';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat1Label" TEXT NOT NULL DEFAULT 'Honours, Computer Science';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat2Num" TEXT NOT NULL DEFAULT '6 months';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat2Label" TEXT NOT NULL DEFAULT 'at a working print press';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat3Num" TEXT NOT NULL DEFAULT '5';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat3Label" TEXT NOT NULL DEFAULT 'selected projects';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat4Num" TEXT NOT NULL DEFAULT '3';
ALTER TABLE "SiteContent" ADD COLUMN "heroStat4Label" TEXT NOT NULL DEFAULT 'disciplines, one standard';
ALTER TABLE "SiteContent" ADD COLUMN "aboutParagraph3" TEXT NOT NULL DEFAULT 'I am looking for entry-level and remote roles in web development or data analysis, where I can keep learning and ship useful work.';

-- Replace the existing public copy with the corrected, provable wording.
-- Everything below stays editable from Admin > Site Content.
UPDATE "SiteContent" SET
  "heroSubtext" = 'I build responsive web products, design brand identities, and turn raw data into clear decisions. Open to entry-level and remote roles.',
  "aboutParagraph1" = 'I am Fasinu David Omotayo, a software developer, data analyst and designer based in Lagos. I graduated with First Class Honours in Computer Science, and I enjoy work where code, data and design meet.',
  "aboutParagraph2" = 'I completed a six-month internship at a working print press, which taught me to deliver to a brief and a deadline. I am also training in cybersecurity, and it shapes how I build: access is protected and data is handled with care.',
  "heroRoles" = 'Software Developer,Data Analyst,Graphic Designer',
  "whatsappUrl" = '2348024505354'
WHERE "id" = 1;

-- Remove em dashes from any existing public text
UPDATE "SiteContent" SET
  "contactSubtext" = REPLACE("contactSubtext", ' — ', ', '),
  "aboutHeadingLine1" = REPLACE("aboutHeadingLine1", ' — ', ', '),
  "aboutHeadingLine2" = REPLACE("aboutHeadingLine2", ' — ', ', '),
  "heroTagline" = REPLACE("heroTagline", ' — ', ', ')
WHERE "id" = 1;
UPDATE "Work" SET
  "description" = REPLACE("description", ' — ', ', '),
  "problem" = REPLACE("problem", ' — ', ', '),
  "approach" = REPLACE("approach", ' — ', ', '),
  "result" = REPLACE("result", ' — ', ', ');

-- Skill spelling
UPDATE "Skill" SET "name" = 'Adobe Illustrator' WHERE LOWER("name") = 'adobe illustrator';
UPDATE "Skill" SET "name" = 'CorelDRAW' WHERE LOWER(REPLACE("name", ' ', '')) = 'coreldraw';

-- Missing skills, placed in the same category as a related skill you already
-- have (or a sensible default). Skipped if a skill with that name exists.
INSERT INTO "Skill" ("category", "name", "order")
SELECT COALESCE((SELECT "category" FROM "Skill" WHERE LOWER("name") = 'excel' LIMIT 1), 'Data & Analytics'), 'Power Query', 90
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") = 'power query');
INSERT INTO "Skill" ("category", "name", "order")
SELECT COALESCE((SELECT "category" FROM "Skill" WHERE LOWER("name") = 'excel' LIMIT 1), 'Data & Analytics'), 'Pivot Tables', 91
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") = 'pivot tables');
INSERT INTO "Skill" ("category", "name", "order")
SELECT COALESCE((SELECT "category" FROM "Skill" WHERE LOWER("name") = 'javascript' LIMIT 1), 'Languages'), 'TypeScript', 90
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") = 'typescript');
INSERT INTO "Skill" ("category", "name", "order")
SELECT COALESCE((SELECT "category" FROM "Skill" WHERE LOWER("name") IN ('react', 'next.js') LIMIT 1), 'Frameworks'), 'Tailwind CSS', 90
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") = 'tailwind css');
INSERT INTO "Skill" ("category", "name", "order")
SELECT COALESCE((SELECT "category" FROM "Skill" WHERE LOWER("name") IN ('react', 'next.js') LIMIT 1), 'Frameworks'), 'Three.js', 91
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") = 'three.js');
INSERT INTO "Skill" ("category", "name", "order")
SELECT 'Security', 'Cybersecurity (learning)', 0
WHERE NOT EXISTS (SELECT 1 FROM "Skill" WHERE LOWER("name") LIKE 'cybersecurity%');