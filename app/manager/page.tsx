"use client";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { TicketTable } from "@/components/ticket-table";
import { useTickets } from "@/hooks/use-tickets";
import { staffMembers } from "@/lib/constants";
import { formatDuration, minutesBetween } from "@/lib/time";

export default function ManagerPage() {
  const { tickets, mode } = useTickets();
  const completed = tickets.filter((t) => t.status === "completed");
  const pending = tickets.filter((t) => t.status === "pending").length;
  const processing = tickets.filter((t) => t.status === "accepted" || t.status === "processing").length;
  const timeout = tickets.filter((t) => t.status === "timeout").length;
  const avgAccept = average(tickets.map((t) => minutesBetween(t.created_at, t.accepted_at)).filter(isNumber));
  const avgComplete = average(completed.map((t) => minutesBetween(t.accepted_at ?? t.created_at, t.completed_at)).filter(isNumber));
  const ranking = staffMembers
    .map((staff) => ({
      staff,
      count: completed.filter((ticket) => ticket.assignee_id === staff.id).length
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <AppShell title="主管运营看板" eyebrow={mode === "supabase" ? "今日实时数据" : "本地 Demo 数据"}>
      <section className="mb-5 grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="今日总单" value={tickets.length} />
        <KpiCard label="待接单" value={pending} tone={pending ? "danger" : "light"} />
        <KpiCard label="处理中" value={processing} />
        <KpiCard label="已完成" value={completed.length} tone="light" />
        <KpiCard label="已超时" value={timeout} tone={timeout ? "danger" : "light"} />
        <KpiCard label="平均接单" value={formatDuration(avgAccept)} tone="light" />
        <KpiCard label="平均完成" value={formatDuration(avgComplete)} tone="light" />
      </section>
      <section className="mb-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-panel">
          <h2 className="mb-4 text-xl font-black">员工完成排行</h2>
          <div className="space-y-3">
            {ranking.length ? ranking.map((row, index) => (
              <div key={row.staff.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="font-bold">#{index + 1} {row.staff.name}</span>
                <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">{row.count} 单</span>
              </div>
            )) : <p className="text-white/60">暂无已完成工单</p>}
          </div>
        </div>
        <div className="rounded-3xl bg-white/80 p-6 shadow-panel">
          <h2 className="mb-2 text-xl font-black">主管关注点</h2>
          <p className="leading-7 text-slate-600">
            先看红色超时指标，再看待接单数量和平均接单时间。Demo 阶段所有统计基于当前工单集合，接入 Supabase 后可按酒店营业日过滤。
          </p>
        </div>
      </section>
      <TicketTable tickets={tickets} />
    </AppShell>
  );
}

function isNumber(value: number | null): value is number {
  return typeof value === "number";
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
