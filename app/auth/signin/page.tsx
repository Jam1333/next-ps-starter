"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("demo@photoshop.local");
  const [name, setName] = useState("Demo Creator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="panel w-full max-w-2xl overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr] md:items-stretch">
          <div className="rounded-[2rem] border border-white/8 bg-gradient-to-br from-violet-500/20 via-cyan-400/10 to-emerald-400/10 p-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-200">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Demo sign in
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Enter the studio</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              This starter uses a demo credentials flow so you can run the app without OAuth setup.
              Replace it with GitHub, Google, or email magic links later.
            </p>
          </div>

          <form
            className="rounded-[2rem] border border-white/8 bg-slate-950/70 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);

              const res = await signIn("credentials", {
                email,
                name,
                redirect: false,
                callbackUrl: "/dashboard"
              });

              setLoading(false);
              if (res?.error) {
                setError(res.error);
                return;
              }

              window.location.href = res?.url ?? "/dashboard";
            }}
          >
            <label className="label">Email</label>
            <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

            <label className="label">Name</label>
            <input className="input mb-4" value={name} onChange={(e) => setName(e.target.value)} type="text" />

            {error ? <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

            <button className="soft-btn h-12 w-full text-base" disabled={loading}>
              {loading ? "Signing in..." : "Open dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Default demo account: demo@photoshop.local
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
