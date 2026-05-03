import { cn } from "@/lib/utils";

export function KpiCard({ label, value, tone = "dark" }: { label: string; value: string | number; tone?: "dark" | "light" | "danger" }) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 shadow-panel",
        tone === "dark" && "bg-slate-950 text-white",
        tone === "light" && "bg-white/85 text-slate-950",
        tone === "danger" && "bg-red-600 text-white"
      )}
    >
      <p className="text-sm font-bold opacity-70">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}
