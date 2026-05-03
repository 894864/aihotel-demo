"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TicketCard } from "@/components/ticket-card";
import { useTickets } from "@/hooks/use-tickets";
import { isTicketOverdue } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/types";

type MainFilter = "unfinished" | "unaccepted" | "accepted" | "completed" | "timeout";
type SortKey = "urgency" | "newest" | "oldest";

const filterLabels: Record<MainFilter, string> = {
  unfinished: "未完成",
  unaccepted: "未接单",
  accepted: "已接单",
  completed: "已完成",
  timeout: "已超时"
};

export default function FrontdeskPage() {
  const { tickets, loading, message, mode, resetDemo } = useTickets();
  const [filter, setFilter] = useState<MainFilter>("unfinished");
  const [sort, setSort] = useState<SortKey>("urgency");

  const stats = useMemo(() => {
    const unfinished = tickets.filter((ticket) => !isClosed(ticket));
    return {
      unfinished: unfinished.length,
      unaccepted: unfinished.filter(isUnaccepted).length,
      accepted: unfinished.filter(isAccepted).length,
      completed: tickets.filter((ticket) => ticket.status === "completed").length,
      timeout: unfinished.filter(isOverdue).length
    };
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        if (filter === "unfinished") return !isClosed(ticket);
        if (filter === "unaccepted") return !isClosed(ticket) && isUnaccepted(ticket);
        if (filter === "accepted") return !isClosed(ticket) && isAccepted(ticket);
        if (filter === "completed") return ticket.status === "completed";
        if (filter === "timeout") return !isClosed(ticket) && isOverdue(ticket);
        return true;
      })
      .sort((a, b) => compareTickets(a, b, sort));
  }, [filter, sort, tickets]);

  function selectFilter(nextFilter: MainFilter) {
    setFilter(nextFilter);
    if (nextFilter === "timeout") setSort("oldest");
  }

  return (
    <AppShell title="前台实时客需看板" eyebrow={mode === "supabase" ? "Supabase Realtime 在线" : "本地 Demo 实时模式"}>
      <section className="mb-5 grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
        <FilterStat active={filter === "unfinished"} label="未完成" value={stats.unfinished} onClick={() => selectFilter("unfinished")} tone="slate" />
        <FilterStat active={filter === "timeout"} label="已超时" value={stats.timeout} onClick={() => selectFilter("timeout")} tone="red" />
        <FilterStat active={filter === "unaccepted"} label="未接单" value={stats.unaccepted} onClick={() => selectFilter("unaccepted")} tone="amber" />
        <FilterStat active={filter === "accepted"} label="已接单" value={stats.accepted} onClick={() => selectFilter("accepted")} tone="blue" />
        <FilterStat active={filter === "completed"} label="已完成" value={stats.completed} onClick={() => selectFilter("completed")} tone="gray" />
      </section>

      <section className="mb-5 rounded-3xl bg-white/75 p-4 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">当前筛选</p>
            <h2 className="text-2xl font-black text-slate-950">{filterLabels[filter]} · {visibleTickets.length} 单</h2>
          </div>

          <Select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="max-w-44">
            <option value="urgency">紧要优先</option>
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
          </Select>

          <Button variant="outline" onClick={resetDemo}>
            <RefreshCw className="h-4 w-4" />
            重置演示数据
          </Button>
        </div>
        <p className="mt-3 rounded-2xl bg-slate-950/5 p-3 text-sm font-bold text-slate-700">
          {message ?? "点击顶部数据卡片即可筛选工单。超时默认按等待最久优先；其它筛选可选择紧要、最新或最早。"}
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white/80 p-10 text-center font-bold">正在加载工单...</div>
      ) : visibleTickets.length ? (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </section>
      ) : (
        <div className="rounded-3xl bg-white/80 p-10 text-center font-bold text-slate-600">当前筛选下暂无工单</div>
      )}
    </AppShell>
  );
}

function FilterStat({
  active,
  label,
  value,
  tone,
  onClick
}: {
  active: boolean;
  label: string;
  value: number;
  tone: "slate" | "amber" | "blue" | "gray" | "red";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-white/90 p-3 text-left shadow-panel transition hover:-translate-y-0.5 hover:bg-white md:rounded-3xl md:p-5",
        active ? "border-slate-950 ring-2 ring-slate-950/10" : "border-white/70"
      )}
    >
      <p className="text-xs font-bold text-slate-500 md:text-sm">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-black md:mt-3 md:text-4xl",
          tone === "red" && "text-red-600",
          tone === "amber" && "text-amber-600",
          tone === "blue" && "text-blue-700",
          tone === "gray" && "text-slate-500",
          tone === "slate" && "text-slate-950"
        )}
      >
        {value}
      </p>
    </button>
  );
}

function compareTickets(a: Ticket, b: Ticket, sort: SortKey) {
  if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  const overdueDelta = Number(isOverdue(b)) - Number(isOverdue(a));
  if (overdueDelta !== 0) return overdueDelta;
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function isClosed(ticket: Ticket) {
  return ticket.status === "completed" || ticket.status === "cancelled";
}

function isUnaccepted(ticket: Ticket) {
  return !ticket.assignee_id && !ticket.assignee_name;
}

function isAccepted(ticket: Ticket) {
  return Boolean(ticket.assignee_id || ticket.assignee_name);
}

function isOverdue(ticket: Ticket) {
  return ticket.status === "timeout" || isTicketOverdue(ticket.due_at, ticket.status);
}
