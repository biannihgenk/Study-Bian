import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProjectsClient from '@/components/projects/ProjectsClient';

export default async function ProjectsPage() {
  const user = await requireAuth();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { projectTasks: { orderBy: { order: 'asc' } }, images: { orderBy: { order: 'asc' } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
  return <ProjectsClient initialProjects={JSON.parse(JSON.stringify(projects))} />;
}
