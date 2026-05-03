import Link from "next/link";
import { Hotel } from "lucide-react";

const nav = [
  ["前台", "/frontdesk"],
  ["员工", "/staff"],
  ["主管", "/manager"],
  ["AI 来电", "/ai-call"]
];

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <main className="hotel-grid min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-slate-950 px-5 py-5 text-white shadow-panel md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-slate-950">
              <Hotel className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">{eyebrow}</p>
              <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
