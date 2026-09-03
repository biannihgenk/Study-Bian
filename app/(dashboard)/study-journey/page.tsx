import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function StudyJourneyOverview() {
  const user = await requireAuth();

  const [subjects, goals, competitions, projects] = await Promise.all([
    prisma.learningSubject.findMany({
      where: { userId: user.id },
      include: { topics: true },
      orderBy: { order: 'asc' },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: 'Active' },
      include: { milestones: true },
      orderBy: { priority: 'desc' },
    }),
    prisma.competition.findMany({
      where: { userId: user.id, status: { in: ['Planning', 'Ongoing'] } },
      include: { tasks: true },
      orderBy: { deadline: 'asc' },
    }),
    prisma.project.findMany({
      where: { userId: user.id, status: { in: ['Idea', 'Planning', 'In Development'] } },
      include: { projectTasks: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const subjectProgress = subjects.map((s) => {
    const total = s.topics.length;
    const completed = s.topics.filter((t) => t.completed).length;
    return {
      id: s.id,
      title: s.title,
      icon: s.icon,
      color: s.color,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
    };
  });

  const hasContent = subjects.length > 0 || goals.length > 0 || competitions.length > 0 || projects.length > 0;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>My Journey</h1>
      <p style={{ color: 'var(--color-muted-foreground)', fontSize: 14, marginBottom: 28 }}>
        Your learning progress at a glance.
      </p>

      {!hasContent ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">🚀</div>
          <h2 className="empty-state-title">Your journey starts here</h2>
          <p className="empty-state-description">
            Begin by adding your learning subjects, goals, or projects.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/study-journey/learning?add=true" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              Add Learning
            </Link>
            <Link href="/study-journey/goals?add=true" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
              Add Goal
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Learning Subjects */}
          {subjectProgress.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Learning Progress</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {subjectProgress.map((s) => (
                  <Link key={s.id} href="/study-journey/learning" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card card-interactive" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{s.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: s.color }}>
                          {s.progress}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${s.progress}%`, background: s.color }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 8 }}>
                        {s.completed} of {s.total} topics completed
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Active Goals</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {goals.map((g) => (
                  <Link key={g.id} href="/study-journey/goals" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card card-interactive" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{g.title}</span>
                        <span className={`badge badge-${g.priority === 'High' || g.priority === 'Urgent' ? 'destructive' : 'muted'}`}>
                          {g.priority}
                        </span>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${g.progress}%` }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                        {g.progress}% complete · {g.milestones.filter((m) => m.completed).length}/{g.milestones.length} milestones
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Competitions */}
          {competitions.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Active Competitions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {competitions.map((c) => {
                  const daysLeft = c.deadline ? Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <Link key={c.id} href="/study-journey/competitions" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card card-interactive" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>🏆 {c.name}</span>
                          {daysLeft !== null && daysLeft >= 0 && (
                            <span className={`badge ${daysLeft <= 5 ? 'badge-destructive' : 'badge-muted'}`}>
                              {daysLeft}d left
                            </span>
                          )}
                        </div>
                        <div className="progress-bar" style={{ marginBottom: 8 }}>
                          <div className="progress-bar-fill" style={{ width: `${c.progress}%` }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                          {c.progress}% · {c.tasks.filter((t) => t.completed).length}/{c.tasks.length} tasks
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Active Projects</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {projects.map((p) => (
                  <Link key={p.id} href="/study-journey/projects" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card card-interactive" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>💻 {p.name}</span>
                        <span className="badge badge-primary">{p.status}</span>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                        {p.progress}% · {p.projectTasks.filter((t) => t.completed).length}/{p.projectTasks.length} tasks
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
