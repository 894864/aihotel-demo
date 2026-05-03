import { Badge } from "@/components/ui/badge";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { Priority, TicketStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const variant =
    status === "completed" ? "success" : status === "timeout" ? "danger" : status === "pending" ? "warning" : "default";
  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const variant = priority === "urgent" || priority === "high" ? "danger" : priority === "normal" ? "warning" : "slate";
  return <Badge variant={variant}>{priorityLabels[priority]}</Badge>;
}
