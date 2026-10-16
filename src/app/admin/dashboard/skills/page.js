import { prisma } from '@/lib/db';
import SkillsManager from '@/components/admin/SkillsManager';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });

  return (
    <>
      <h1 className="page-title">Skills</h1>
      <p className="page-sub">Shown in the Skills section of the public site, grouped by category.</p>
      <SkillsManager initialSkills={skills} />
    </>
  );
}
