import type { Department, Priority, StaffMember, TicketStatus } from "@/lib/types";

export const departmentLabels: Record<Department, string> = {
  housekeeping: "客房部",
  engineering: "工程部",
  frontdesk: "前台",
  food: "餐饮部",
  manager: "主管"
};

export const statusLabels: Record<TicketStatus, string> = {
  pending: "待接单",
  accepted: "已接单",
  processing: "处理中",
  completed: "已完成",
  timeout: "已超时",
  cancelled: "已取消"
};

export const priorityLabels: Record<Priority, string> = {
  low: "低",
  normal: "普通",
  high: "高",
  urgent: "紧急"
};

export const staffMembers: StaffMember[] = [
  { id: "hk-lin", name: "林阿姨", department: "housekeeping", role: "楼层服务员" },
  { id: "hk-chen", name: "陈主管", department: "housekeeping", role: "客房主管" },
  { id: "eng-wang", name: "王师傅", department: "engineering", role: "工程维修" },
  { id: "food-zhao", name: "赵领班", department: "food", role: "餐饮领班" },
  { id: "fd-qin", name: "秦前台", department: "frontdesk", role: "前台接待" },
  { id: "mgr-he", name: "何经理", department: "manager", role: "值班经理" }
];

export const slaMinutes: Record<Priority, number> = {
  low: 45,
  normal: 30,
  high: 15,
  urgent: 8
};
