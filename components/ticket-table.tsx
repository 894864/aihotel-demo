"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { useCallCapable } from "@/hooks/use-call-capable";
import { getAssigneePhone } from "@/lib/assignee";
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
  const canCall = useCallCapable();

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
        <Table className="w-[820px] min-w-[820px] table-fixed">
          <colgroup>
            <col className="w-[70px]" />
            <col className="w-[92px]" />
            <col className="w-[132px]" />
            <col className="w-[232px]" />
            <col className="w-[92px]" />
            <col className="w-[92px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead className="bg-slate-950/5">
            <tr>
              <Th className="px-2 py-3">房号</Th>
              <Th className="px-2 py-3">状态</Th>
              <Th className="px-2 py-3">负责人</Th>
              <Th className="px-2 py-3">需求</Th>
              <Th className="px-2 py-3">部门</Th>
              <Th className="px-2 py-3">等待</Th>
              <Th className="px-2 py-3">完成耗时</Th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.map((ticket) => (
              <tr key={ticket.id}>
                <Td className="px-2 py-3 text-lg font-black">{ticket.room}</Td>
                <Td className="px-2 py-3">
                  <StatusBadge status={getDisplayStatus(ticket)} />
                </Td>
                <Td className="px-2 py-3">
                  <AssigneeCell ticket={ticket} canCall={canCall} />
                </Td>
                <Td className="px-2 py-3 font-medium leading-5 text-slate-900">{ticket.request}</Td>
                <Td className="px-2 py-3">{departmentLabels[ticket.department]}</Td>
                <Td className="px-2 py-3">
                  {formatDuration(minutesBetween(ticket.created_at, ticket.accepted_at) ?? minutesSince(ticket.created_at))}
                </Td>
                <Td className="px-2 py-3">{formatDuration(minutesBetween(ticket.accepted_at ?? ticket.created_at, ticket.completed_at))}</Td>
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

function AssigneeCell({ ticket, canCall }: { ticket: Ticket; canCall: boolean }) {
  if (!ticket.assignee_name) {
    return <span className="text-slate-400">未接单</span>;
  }

  const phone = getAssigneePhone(ticket);
  if (!phone) {
    return <span className="font-bold text-slate-700">{ticket.assignee_name}</span>;
  }

  if (canCall) {
    return (
      <a
        className="inline-flex items-center gap-1 font-bold text-blue-700 underline-offset-2 hover:underline"
        href={`tel:${phone}`}
        title={`拨打 ${phone}`}
      >
        <Phone className="h-4 w-4" />
        <span>{ticket.assignee_name}</span>
      </a>
    );
  }

  return (
    <span className="block font-bold text-slate-700">
      {ticket.assignee_name}
      <span className="mt-0.5 block text-xs font-semibold text-slate-500">{phone}</span>
    </span>
  );
}
