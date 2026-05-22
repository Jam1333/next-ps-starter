import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, Layers3, Sparkles, WandSparkles, ShieldCheck, Cloud } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-12 lg:px-8">
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-violet-300" />
          Photoshop-inspired editor starter
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              A glossy, local-first image editor for the web.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Built as a clean foundation for a Photoshop clone: Next.js App Router, Prisma with SQLite,
              Auth.js-style sign in, and a canvas editor with layered state, autosave, and a luxurious UI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={session ? "/dashboard" : "/auth/signin"} className="soft-btn h-12 px-5 text-base">
                Open studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Feature icon={<WandSparkles className="h-5 w-5" />} title="Canvas engine" text="Layers, brush strokes, text, shapes, and drag support." />
              <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Auth + data" text="Demo auth, Prisma models, and document drafts/versions." />
              <Feature icon={<Cloud className="h-5 w-5" />} title="Autosave" text="Draft saves are automatic; versions are explicit." />
            </div>
          </div>

          <div className="panel relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-aurora opacity-90" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/25">
                  <Layers3 className="h-6 w-6 text-violet-200" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Studio</div>
                  <div className="text-2xl font-semibold text-white">Neo Canvas</div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["Project shell", "Dashboard, document manager, auth-gated routes."],
                  ["Editor workspace", "Tool bar, canvas stage, layer stack, and inspector."],
                  ["Persistence", "SQLite + Prisma document drafts and immutable versions."]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="mt-1 text-sm text-slate-400">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="mt-16 grid gap-4 lg:grid-cols-4">
          {[
            "App Router route handlers",
            "Prisma SQLite schema",
            "Demo login with NextAuth",
            "Fancy glassmorphism UI"
          ].map((item) => (
            <div key={item} className="panel px-5 py-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-violet-200">{icon}</div>
        <div>
          <div className="font-medium text-white">{title}</div>
          <div className="text-sm text-slate-400">{text}</div>
        </div>
      </div>
    </div>
  );
}
