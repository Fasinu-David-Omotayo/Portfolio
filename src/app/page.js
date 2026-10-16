import { prisma } from '@/lib/db';
import { getSiteContent } from '@/lib/siteContent';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import PageViewTracker from '@/components/PageViewTracker';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [works, skills, testimonials, content] = await Promise.all([
    prisma.work.findMany({
      where: { status: 'live' },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { order: 'asc' } } },
    }),
    prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
    prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
    getSiteContent(),
  ]);

  return (
    <>
      <PageViewTracker />
      <CustomCursor />
      <ScrollProgress />
      <Nav name={content.heroName} logoUrl={content.logoUrl} />
      <Hero content={content} skills={skills} />
      <Portfolio works={works} />
      <About content={content} />
      <Skills skills={skills} />
      <Testimonials testimonials={testimonials} />
      <Contact content={content} />
      <Footer name={content.heroName} />
    </>
  );
}
