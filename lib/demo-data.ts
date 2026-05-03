import { addMinutes, subMinutes } from "date-fns";
import { slaMinutes } from "@/lib/constants";
import type { Ticket } from "@/lib/types";

function makeTicket(seed: Omit<Ticket, "due_at">): Ticket {
  return {
    ...seed,
    due_at: addMinutes(new Date(seed.created_at), slaMinutes[seed.priority]).toISOString()
  };
}

const oneYearLater = () => addMinutes(new Date(), 525_600).toISOString();

export const demoTickets: Ticket[] = [
  makeTicket({
    id: "demo-1",
    room: "1208",
    request: "需要两条浴巾和两瓶矿泉水",
    department: "housekeeping",
    source: "ai_call",
    status: "pending",
    priority: "normal",
    assignee_id: null,
    assignee_name: null,
    assignee_phone: null,
    created_at: subMinutes(new Date(), 8).toISOString(),
    accepted_at: null,
    completed_at: null,
    notes: "原始来电文本：1208房间需要浴巾和矿泉水"
  }),
  makeTicket({
    id: "demo-2",
    room: "1602",
    request: "空调不制冷，客人要求尽快维修",
    department: "engineering",
    source: "ai_call",
    status: "processing",
    priority: "high",
    assignee_id: "eng-wang",
    assignee_name: "王师傅",
    assignee_phone: "13800020001",
    created_at: subMinutes(new Date(), 18).toISOString(),
    accepted_at: subMinutes(new Date(), 14).toISOString(),
    completed_at: null,
    notes: "客人语气较急"
  }),
  makeTicket({
    id: "demo-3",
    room: "0906",
    request: "要求开具公司抬头发票",
    department: "frontdesk",
    source: "frontdesk",
    status: "completed",
    priority: "normal",
    assignee_id: "fd-qin",
    assignee_name: "秦前台",
    assignee_phone: "13800040001",
    created_at: subMinutes(new Date(), 55).toISOString(),
    accepted_at: subMinutes(new Date(), 49).toISOString(),
    completed_at: subMinutes(new Date(), 32).toISOString(),
    notes: null
  }),
  makeTicket({
    id: "demo-4",
    room: "2101",
    request: "隔壁噪音严重，客人要求经理处理",
    department: "manager",
    source: "ai_call",
    status: "timeout",
    priority: "high",
    assignee_id: null,
    assignee_name: null,
    assignee_phone: null,
    created_at: subMinutes(new Date(), 35).toISOString(),
    accepted_at: null,
    completed_at: null,
    notes: "已超过高优先级 SLA"
  }),
  {
    id: "demo-5",
    room: "1105",
    request: "需要补充两瓶矿泉水和一套洗漱用品",
    department: "housekeeping",
    source: "frontdesk",
    status: "pending",
    priority: "low",
    assignee_id: null,
    assignee_name: null,
    assignee_phone: null,
    created_at: new Date().toISOString(),
    accepted_at: null,
    completed_at: null,
    due_at: oneYearLater(),
    notes: "长期不超时演示单"
  },
  {
    id: "demo-6",
    room: "1310",
    request: "客人需要加送一个枕头和一条浴巾",
    department: "housekeeping",
    source: "frontdesk",
    status: "pending",
    priority: "low",
    assignee_id: null,
    assignee_name: null,
    assignee_phone: null,
    created_at: new Date().toISOString(),
    accepted_at: null,
    completed_at: null,
    due_at: oneYearLater(),
    notes: "长期不超时演示单"
  }
];
