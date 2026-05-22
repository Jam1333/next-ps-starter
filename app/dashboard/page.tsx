import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { Plus, FolderOpen, PencilLine, Rocket } from "lucide-react";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const params = await searchParams;
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }]
    },
    include: { documents: true },
    orderBy: { updatedAt: "desc" }
  });

  const activeProjectId = params.project ?? projects[0]?.id ?? null;
  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) ?? projects[0] : projects[0];
  const documents = activeProject
    ? await prisma.document.findMany({
        where: { projectId: activeProject.id },
        include: { currentVersion: true, draft: true },
        orderBy: { updatedAt: "desc" }
      })
    : [];

  return (
    <main className="min-h-screen">
      <Topbar title="Dashboard" subtitle="Projects, documents, and editing checkpoints." />

      <div className="mx-auto grid max-w-[1800px] grid-cols-12 gap-4 px-4 py-4 lg:px-6">
        <div className="col-span-12 xl:col-span-3">
          <Sidebar projects={projects.map((project) => ({ id: project.id, name: project.name, documentsCount: project.documents.length }))} activeProjectId={activeProjectId ?? undefined} />
        </div>

        <section className="col-span-12 grid gap-4 xl:col-span-9">
          <div className="panel overflow-hidden p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <Rocket className="h-3.5 w-3.5 text-violet-300" />
                  Your creative workspace
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  {activeProject?.name ?? "No project yet"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Create a document, open the editor, and start painting layers.
                </p>
              </div>

              <form action="/api/projects" method="post">
                <button className="soft-btn h-12 px-5" type="submit">
                  <Plus className="h-4 w-4" />
                  New project
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Stat title="Projects" value={String(projects.length)} />
            <Stat title="Documents" value={String(documents.length)} />
            <Stat title="Autosave" value="On" />
          </div>

          <div className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Documents</h3>
                <p className="text-sm text-slate-400">Open a file or create a fresh canvas.</p>
              </div>

              {activeProject ? (
                <form action={`/api/projects/${activeProject.id}/documents`} method="post">
                  <button className="soft-btn" type="submit">
                    <PencilLine className="h-4 w-4" />
                    New document
                  </button>
                </form>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => (
                <Link key={document.id} href={`/editor/${document.id}`} className="group rounded-3xl border border-white/8 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/8">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/20">
                      <FolderOpen className="h-5 w-5 text-violet-200" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-slate-300">
                      {document.width}×{document.height}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-white">{document.name}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {document.currentVersion ? "Published version" : "Draft only"} · updated {document.updatedAt.toLocaleString()}
                  </div>
                </Link>
              ))}

              {!documents.length ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                  Create a document to start the editor. The default starter comes with a prebuilt canvas state.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="panel p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
