import { prisma } from '@/lib/db';
import MessagesManager from '@/components/admin/MessagesManager';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <h1 className="page-title">Messages</h1>
      <p className="page-sub">Submissions from the Contact form on the public site.</p>
      <MessagesManager initialMessages={messages} />
    </>
  );
}
