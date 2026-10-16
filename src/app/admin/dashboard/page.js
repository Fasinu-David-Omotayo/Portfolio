import { prisma } from '@/lib/db';
import { getStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_LABEL = { dev: 'Software Development', design: 'Graphic Design', data: 'Data Analysis' };

export default async function OverviewPage() {
  const [stats, activity] = await Promise.all([
    getStats(),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  const deltaClass = stats.viewsChange > 0 ? 'up' : stats.viewsChange < 0 ? 'warn' : 'down';
  const deltaSign = stats.viewsChange > 0 ? '+' : '';

  return (
    <>
      <h1 className="page-title">Overview</h1>
      <p className="page-sub">A snapshot of how the portfolio is doing.</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="num">{stats.pageViews30}</div>
          <div className="lbl">Page Views (30d)</div>
          <div className={`delta ${deltaClass}`}>{deltaSign}{stats.viewsChange}% vs prior 30d</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.totalWorks}</div>
          <div className="lbl">Live Works</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.unreadMessages}</div>
          <div className="lbl">Unread Messages</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.filterClicks30}</div>
          <div className="lbl">Filter Clicks (30d)</div>
          {stats.topType && (
            <div className="delta up">Top: {TYPE_LABEL[stats.topType] || stats.topType}</div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">Recent Activity</div>
        {activity.length === 0 ? (
          <div className="empty-panel">Nothing yet — activity will show up here as visitors use the site.</div>
        ) : (
          activity.map((item) => (
            <div className="activity-item" key={item.id}>
              <span className={`dot ${item.type}`} />
              <div>
                <div className="activity-text">{item.message}</div>
                <div className="activity-time">{timeAgo(item.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
