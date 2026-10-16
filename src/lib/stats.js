import { prisma } from './db';

export async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [pageViews30, pageViewsPrev30, totalWorks, unreadMessages, filterClicks30, filterBreakdown] =
    await Promise.all([
      prisma.activity.count({ where: { type: 'page_view', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.activity.count({
        where: { type: 'page_view', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      prisma.work.count({ where: { status: 'live' } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.activity.count({ where: { type: 'filter_click', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.activity.findMany({
        where: { type: 'filter_click', createdAt: { gte: thirtyDaysAgo } },
        select: { meta: true },
      }),
    ]);

  const typeCounts = {};
  filterBreakdown.forEach((row) => {
    try {
      const type = JSON.parse(row.meta || '{}').type;
      if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
    } catch {
      // ignore malformed meta
    }
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const viewsChange =
    pageViewsPrev30 === 0
      ? (pageViews30 > 0 ? 100 : 0)
      : Math.round(((pageViews30 - pageViewsPrev30) / pageViewsPrev30) * 100);

  return { pageViews30, viewsChange, totalWorks, unreadMessages, filterClicks30, topType };
}
