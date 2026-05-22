"use client";

import { Bell, Layers3, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-violet-500/20 shadow-glow">
            <Layers3 className="h-5 w-5 text-violet-200" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">{title}</h1>
            <p className="text-xs text-slate-400">{subtitle ?? "A studio built for bold ideas."}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 md:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Local-first autosave
          </div>
          <button className="soft-btn" onClick={() => signOut({ callbackUrl: "/" })}>
            <Bell className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
