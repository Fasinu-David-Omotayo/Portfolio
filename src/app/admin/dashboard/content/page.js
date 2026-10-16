import { getSiteContent } from '@/lib/siteContent';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const content = await getSiteContent();

  return (
    <>
      <h1 className="page-title">Site Content</h1>
      <p className="page-sub">Everything editable on the Hero, About, and Contact sections.</p>
      <ContentEditor initialContent={content} />
    </>
  );
}
