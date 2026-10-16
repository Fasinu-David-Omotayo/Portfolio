import { prisma } from '@/lib/db';
import TestimonialsManager from '@/components/admin/TestimonialsManager';

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <h1 className="page-title">Testimonials</h1>
      <p className="page-sub">Client and collaborator quotes shown in the Testimonials section of the public site.</p>
      <TestimonialsManager initialTestimonials={testimonials} />
    </>
  );
}
