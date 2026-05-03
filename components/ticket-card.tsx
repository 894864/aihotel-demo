"use client";

import type React from "react";
import { Clock, MapPin, Phone, UserRound } from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { departmentLabels } from "@/lib/constants";
import { formatDuration, isTicketOverdue, minutesBetween, minutesSince } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { StaffMember, Ticket } from "@/lib/types";

export function TicketCard({
  ticket,
  staff,
  onAccept,
  onComplete,
  compact = false
}: {
  ticket: Ticket;
  staff?: StaffMember;
  onAccept?: (ticket: Ticket) => void;
  onComplete?: (ticket: Ticket) => void;
  compact?: boolean;
}) {
  const overdue = isTicketOverdue(ticket.due_at, ticket.status) || ticket.status === "timeout";
  const visual = getTicketVisual(ticket, overdue);
  const waitMinutes = minutesBetween(ticket.created_at, ticket.accepted_at) ?? minutesSince(ticket.created_at);
  const doneMinutes = minutesBetween(ticket.accepted_at ?? ticket.created_at, ticket.completed_at);
  const canAccept = Boolean(staff) && (ticket.status === "pending" || ticket.status === "timeout") && staff?.department === ticket.department;
  const canComplete = Boolean(staff) && ticket.assignee_id === staff?.id && ticket.status !== "completed";

  return (
    <Card className={cn("relative overflow-hidden border p-5 transition", visual.card, compact && "rounded-2xl p-4")}>
      <div className={cn("absolute left-0 top-0 h-full w-2", visual.bar)} />
      <div className="flex items-start justify-between gap-4 pl-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-2xl px-4 py-2 text-2xl font-black text-white", visual.room)}>{ticket.room}</span>
            <StatusBadge status={overdue && ticket.status !== "completed" && ticket.status !== "cancelled" ? "timeout" : ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className={cn("mt-4 line-clamp-2 min-h-14 text-lg font-bold leading-7", visual.title)} title={ticket.request}>
            {ticket.request}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 pl-3 text-sm text-slate-600 md:grid-cols-2">
        <Info icon={<MapPin className="h-4 w-4" />} label="部门" value={departmentLabels[ticket.department]} />
        <AssigneeInfo ticket={ticket} />
        <Info icon={<Clock className="h-4 w-4" />} label="等待时间" value={formatDuration(waitMinutes)} />
        <Info icon={<Clock className="h-4 w-4" />} label="完成耗时" value={formatDuration(doneMinutes)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pl-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          {ticket.source === "ai_call" ? "AI 来电" : "人工录入"}
        </p>
        {(onAccept || onComplete) && (
          <div className="flex gap-2">
            {onAccept ? (
              <Button size="sm" disabled={!canAccept} onClick={() => onAccept(ticket)}>
                一键接单
              </Button>
            ) : null}
            {onComplete ? (
              <Button size="sm" variant="secondary" disabled={!canComplete} onClick={() => onComplete(ticket)}>
                一键完成
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}

function AssigneeInfo({ ticket }: { ticket: Ticket }) {
  const value = ticket.assignee_name ?? "未接单";

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-900/5 px-3 py-2">
      <UserRound className="h-4 w-4" />
      <span className="text-slate-400">负责人</span>
      {ticket.assignee_phone ? (
        <>
          <a
            className="ml-auto flex items-center gap-1 text-right font-bold text-blue-700 underline-offset-2 hover:underline md:hidden"
            href={`tel:${ticket.assignee_phone}`}
            title={`拨打 ${ticket.assignee_phone}`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{value}</span>
          </a>
          <span className="ml-auto hidden text-right font-bold text-slate-800 md:block">
            {value}
            <span className="ml-2 text-xs font-semibold text-slate-500">{ticket.assignee_phone}</span>
          </span>
        </>
      ) : (
        <span className="ml-auto font-bold text-slate-800">{value}</span>
      )}
    </div>
  );
}

function getTicketVisual(ticket: Ticket, overdue: boolean) {
  if (ticket.status === "completed") {
    return {
      card: "border-slate-200 bg-slate-100/90 opacity-80",
      bar: "bg-slate-400",
      room: "bg-slate-500",
      title: "text-slate-600"
    };
  }

  if (ticket.status === "cancelled") {
    return {
      card: "border-zinc-300 bg-zinc-100/90 opacity-75",
      bar: "bg-zinc-700",
      room: "bg-zinc-700",
      title: "text-zinc-600"
    };
  }

  if (overdue) {
    return {
      card: "border-red-400 bg-red-50 shadow-[0_24px_80px_rgba(185,28,28,0.18)]",
      bar: "bg-red-600",
      room: "bg-red-700",
      title: "text-red-950"
    };
  }

  if (ticket.status === "pending") {
    return {
      card: "border-amber-300 bg-amber-50",
      bar: "bg-amber-500",
      room: "bg-amber-600",
      title: "text-slate-950"
    };
  }

  return {
    card: "border-blue-300 bg-blue-50",
    bar: "bg-blue-600",
    room: "bg-blue-700",
    title: "text-slate-950"
  };
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-900/5 px-3 py-2">
      {icon}
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto font-bold text-slate-800">{value}</span>
    </div>
  );
}
