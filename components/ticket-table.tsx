import { StatusBadge } from "@/components/status-badge";
import { Table, Td, Th } from "@/components/ui/table";
import { departmentLabels } from "@/lib/constants";
import { formatDuration, minutesBetween, minutesSince } from "@/lib/time";
import type { Ticket } from "@/lib/types";

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white/85 shadow-panel">
      <Table>
        <thead className="bg-slate-950/5">
          <tr>
            <Th>房号</Th>
            <Th>需求</Th>
            <Th>部门</Th>
            <Th>状态</Th>
            <Th>负责人</Th>
            <Th>等待</Th>
            <Th>完成耗时</Th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <Td className="text-lg font-black">{ticket.room}</Td>
              <Td className="max-w-md font-medium">{ticket.request}</Td>
              <Td>{departmentLabels[ticket.department]}</Td>
              <Td><StatusBadge status={ticket.status} /></Td>
              <Td>{ticket.assignee_name ?? "未接单"}</Td>
              <Td>{formatDuration(minutesBetween(ticket.created_at, ticket.accepted_at) ?? minutesSince(ticket.created_at))}</Td>
              <Td>{formatDuration(minutesBetween(ticket.accepted_at ?? ticket.created_at, ticket.completed_at))}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
