export type TicketStatus = "pending" | "accepted" | "processing" | "completed" | "timeout" | "cancelled";

export type Department = "housekeeping" | "engineering" | "frontdesk" | "food" | "manager";

export type Priority = "low" | "normal" | "high" | "urgent";

export type TicketSource = "ai_call" | "frontdesk" | "staff" | "manager";

export type StaffMember = {
  id: string;
  name: string;
  department: Department;
  role: string;
};

export type Ticket = {
  id: string;
  room: string;
  request: string;
  department: Department;
  source: TicketSource;
  status: TicketStatus;
  priority: Priority;
  assignee_id: string | null;
  assignee_name: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  due_at: string;
  notes: string | null;
};

export type TicketCreateInput = Pick<Ticket, "room" | "request" | "department" | "source" | "priority"> & {
  due_at?: string;
  notes?: string | null;
};
