import type { Department, Priority, TicketCreateInput } from "@/lib/types";

const departmentRules: Array<{ department: Department; words: string[] }> = [
  { department: "engineering", words: ["空调", "漏水", "马桶", "电视", "灯", "电", "热水", "维修", "坏", "堵"] },
  { department: "housekeeping", words: ["毛巾", "牙刷", "打扫", "清洁", "被子", "枕头", "拖鞋", "纸巾", "矿泉水", "浴巾"] },
  { department: "food", words: ["早餐", "晚餐", "送餐", "餐", "咖啡", "牛奶", "水饺", "面", "酒"] },
  { department: "frontdesk", words: ["发票", "退房", "续住", "叫车", "寄存", "押金", "钥匙", "门卡"] },
  { department: "manager", words: ["投诉", "赔偿", "吵", "噪音", "不满意", "经理", "严重"] }
];

export function parseGuestCall(text: string): TicketCreateInput {
  const normalized = text.trim();
  const room = normalized.match(/(?:房间|房号|我是|住在)?\s*([A-Z]?\d{3,5})\s*(?:房|号)?/i)?.[1] ?? "未知";
  const department = detectDepartment(normalized);
  const priority = detectPriority(normalized, department);

  return {
    room,
    request: cleanupRequest(normalized),
    department,
    priority,
    source: "ai_call",
    notes: `原始来电文本：${normalized}`
  };
}

function detectDepartment(text: string): Department {
  const hit = departmentRules.find((rule) => rule.words.some((word) => text.includes(word)));
  return hit?.department ?? "frontdesk";
}

function detectPriority(text: string, department: Department): Priority {
  if (["着火", "火灾", "受伤", "晕倒", "报警"].some((word) => text.includes(word))) return "urgent";
  if (["马上", "立刻", "急", "严重", "投诉"].some((word) => text.includes(word))) return "high";
  if (department === "engineering" || department === "manager") return "high";
  return "normal";
}

function cleanupRequest(text: string) {
  return text
    .replace(/你好|您好|麻烦|请问|前台/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
