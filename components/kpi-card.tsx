import { cn } from "@/lib/utils";

export function KpiCard({ label, value, tone = "dark" }: { label: string; value: string | number; tone?: "dark" | "light" | "danger" }) {
  const renderedValue = typeof value === "string" ? splitValueUnit(value) : null;

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
      {renderedValue ? (
        <p className="mt-3 whitespace-nowrap font-black">
          <span className="text-4xl">{renderedValue.main}</span>
          <span className="ml-1 text-sm opacity-75">{renderedValue.unit}</span>
        </p>
      ) : (
        <p className="mt-3 text-4xl font-black">{value}</p>
      )}
    </div>
  );
}

function splitValueUnit(value: string) {
  if (value === "-") return null;
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return null;
  return {
    main: match[1],
    unit: match[2].trim()
  };
}
