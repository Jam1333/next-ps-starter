import Link from "next/link";
import { ChevronRight, FolderKanban, ImagePlus, Rocket } from "lucide-react";

export function Sidebar({
  projects,
  activeProjectId
}: {
  projects: { id: string; name: string; documentsCount: number }[];
  activeProjectId?: string;
}) {
  return (
    <aside className="panel h-full overflow-hidden p-4">
      <div className="mb-4 rounded-3xl border border-white/8 bg-white/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Rocket className="h-4 w-4 text-violet-300" />
          Workspace
        </div>
        <p className="text-sm text-slate-400">
          Manage projects, documents, and the editor state from one place.
        </p>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard?project=${project.id}`}
            className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
              activeProjectId === project.id
                ? "border-violet-400/30 bg-violet-500/15"
                : "border-white/8 bg-white/5 hover:bg-white/8"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900/70">
                <FolderKanban className="h-4 w-4 text-slate-200" />
              </div>
              <div>
                <div className="font-medium text-white">{project.name}</div>
                <div className="text-xs text-slate-400">{project.documentsCount} document(s)</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
          </Link>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-white/8 bg-gradient-to-br from-violet-500/15 to-cyan-400/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <ImagePlus className="h-4 w-4" />
          Coming next
        </div>
        <p className="text-sm text-slate-300">
          Upload assets, manage brushes, and swap the local store to S3 when you’re ready.
        </p>
      </div>
    </aside>
  );
}
