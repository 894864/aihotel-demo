"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { departmentLabels } from "@/lib/constants";
import { formatDuration, isTicketOverdue, minutesBetween, minutesSince } from "@/lib/time";
import type { Ticket, TicketStatus } from "@/lib/types";

type TableFilter = "all" | "pending" | "accepted" | "completed" | "timeout" | "cancelled";

const filterLabels: Record<TableFilter, string> = {
  all: "全部工单",
  pending: "待接单",
  accepted: "已接单",
  completed: "已完成",
  timeout: "已超时",
  cancelled: "已取消"
};

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [filter, setFilter] = useState<TableFilter>("all");

  const visibleTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filter === "all") return true;
      if (filter === "timeout") return getDisplayStatus(ticket) === "timeout";
      if (filter === "accepted") return isAcceptedTicket(ticket);
      return ticket.status === filter;
    });
  }, [filter, tickets]);

  return (
    <div className="rounded-3xl bg-white/85 p-4 shadow-panel">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">工单明细</h2>
          <p className="mt-1 text-sm text-slate-500">可按状态筛选，表格可左右拖动查看完整信息。</p>
        </div>
        <Select
          aria-label="筛选工单状态"
          className="sm:w-44"
          value={filter}
          onChange={(event) => setFilter(event.target.value as TableFilter)}
        >
          {Object.entries(filterLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <thead className="bg-slate-950/5">
            <tr>
              <Th className="w-24">房号</Th>
              <Th className="w-28">状态</Th>
              <Th className="w-44">负责人</Th>
              <Th className="min-w-[240px]">需求</Th>
              <Th className="w-28">部门</Th>
              <Th className="w-28">等待</Th>
              <Th className="w-32">完成耗时</Th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.map((ticket) => (
              <tr key={ticket.id}>
                <Td className="text-lg font-black">{ticket.room}</Td>
                <Td>
                  <StatusBadge status={getDisplayStatus(ticket)} />
                </Td>
                <Td>
                  <AssigneeCell ticket={ticket} />
                </Td>
                <Td className="min-w-[240px] font-medium text-slate-900">{ticket.request}</Td>
                <Td>{departmentLabels[ticket.department]}</Td>
                <Td>{formatDuration(minutesBetween(ticket.created_at, ticket.accepted_at) ?? minutesSince(ticket.created_at))}</Td>
                <Td>{formatDuration(minutesBetween(ticket.accepted_at ?? ticket.created_at, ticket.completed_at))}</Td>
              </tr>
            ))}
            {!visibleTickets.length && (
              <tr>
                <Td colSpan={7} className="py-10 text-center text-slate-500">
                  当前筛选下暂无工单
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function getDisplayStatus(ticket: Ticket): TicketStatus {
  if (ticket.status !== "completed" && ticket.status !== "cancelled" && isTicketOverdue(ticket.due_at, ticket.status)) {
    return "timeout";
  }
  return ticket.status;
}

function isAcceptedTicket(ticket: Ticket) {
  if (ticket.status === "completed" || ticket.status === "cancelled") return false;
  return ticket.status === "accepted" || ticket.status === "processing" || Boolean(ticket.assignee_id || ticket.assignee_name);
}

function AssigneeCell({ ticket }: { ticket: Ticket }) {
  if (!ticket.assignee_name) {
    return <span className="text-slate-400">未接单</span>;
  }

  if (!ticket.assignee_phone) {
    return <span className="font-bold text-slate-700">{ticket.assignee_name}</span>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline"
      href={`tel:${ticket.assignee_phone}`}
      title={`拨打 ${ticket.assignee_phone}`}
    >
      <Phone className="h-4 w-4" />
      <span>{ticket.assignee_name}</span>
      <span className="text-xs font-semibold text-slate-500">{ticket.assignee_phone}</span>
    </a>
  );
}
