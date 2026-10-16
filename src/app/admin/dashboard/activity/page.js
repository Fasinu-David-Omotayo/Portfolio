import { prisma } from '@/lib/db';
import ActivityFeed from '@/components/admin/ActivityFeed';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const activity = await prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

  return (
    <>
      <h1 className="page-title">Activity</h1>
      <p className="page-sub">Everything happening on the site — uploads, edits, visitor behavior.</p>
      <ActivityFeed initialActivity={activity} />
    </>
  );
}
