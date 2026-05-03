import { staffMembers } from "@/lib/constants";
import type { Ticket } from "@/lib/types";

export function getAssigneePhone(ticket: Ticket) {
  if (ticket.assignee_phone) return ticket.assignee_phone;

  const staff =
    staffMembers.find((member) => member.id === ticket.assignee_id) ??
    staffMembers.find((member) => member.name === ticket.assignee_name);

  return staff?.phone ?? null;
}
