import { prisma } from '@/lib/db';
import WorksManager from '@/components/admin/WorksManager';

export const dynamic = 'force-dynamic';

export default async function WorksPage() {
  const works = await prisma.work.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { images: { orderBy: { order: 'asc' } } },
  });

  return (
    <>
      <h1 className="page-title">Works</h1>
      <p className="page-sub">Everything shown in the public portfolio gallery.</p>
      <WorksManager initialWorks={works} />
    </>
  );
}
