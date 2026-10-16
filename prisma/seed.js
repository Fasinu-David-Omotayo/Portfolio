const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@fasinudavid.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'Fasinu David Omotayo';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, password: hashed, name } });
    console.log(`✓ Admin account created: ${email}`);
    console.log(`  Password: ${password} (change this after first login)`);
  } else {
    console.log(`Admin account already exists for ${email}, skipping.`);
  }

  const workCount = await prisma.work.count();
  if (workCount === 0) {
    console.log('Seeding a few sample works (replace these from the admin dashboard)...');
    await prisma.work.createMany({
      data: [
        {
          title: 'Sample Web App',
          type: 'dev',
          description: 'Replace this with a real project — a short description of what it does and the problem it solves.',
          techStack: 'Next.js,Prisma,PostgreSQL',
          liveUrl: '',
          githubUrl: '',
          imageUrl: '/images/placeholder-work.svg',
          thumbUrl: '/images/placeholder-work.svg',
        },
        {
          title: 'Sample Brand Identity',
          type: 'design',
          subCategory: 'brand',
          description: 'Replace this with a real design project — logo, brand identity, print, etc.',
          imageUrl: '/images/placeholder-work.svg',
          thumbUrl: '/images/placeholder-work.svg',
        },
        {
          title: 'Sample Data Dashboard',
          type: 'data',
          description: 'Replace this with a real data analysis project — what data, what tools, what was found.',
          techStack: 'Python,Pandas,Power BI',
          liveUrl: '',
          imageUrl: '/images/placeholder-work.svg',
          thumbUrl: '/images/placeholder-work.svg',
        },
      ],
    });
  }

  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    console.log('Seeding sample skills (edit these from Admin → Skills)...');
    await prisma.skill.createMany({
      data: [
        { category: 'Languages', name: 'JavaScript', order: 0 },
        { category: 'Languages', name: 'Python', order: 1 },
        { category: 'Languages', name: 'SQL', order: 2 },
        { category: 'Frameworks', name: 'Next.js', order: 0 },
        { category: 'Frameworks', name: 'React', order: 1 },
        { category: 'Design Tools', name: 'Figma', order: 0 },
        { category: 'Design Tools', name: 'Photoshop', order: 1 },
        { category: 'Data & Analytics', name: 'Pandas', order: 0 },
        { category: 'Data & Analytics', name: 'Power BI', order: 1 },
      ],
    });
  }

  const contentExists = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (!contentExists) {
    await prisma.siteContent.create({ data: { id: 1 } });
    console.log('✓ Default site content created (edit it from Admin → Site Content).');
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
