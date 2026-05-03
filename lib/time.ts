import { differenceInMinutes } from "date-fns";

export function minutesSince(date: string) {
  return Math.max(0, differenceInMinutes(new Date(), new Date(date)));
}

export function minutesBetween(start: string | null, end: string | null) {
  if (!start || !end) return null;
  return Math.max(0, differenceInMinutes(new Date(end), new Date(start)));
}

export function formatDuration(minutes: number | null) {
  if (minutes === null) return "-";
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} 小时 ${m} 分钟`;
}

export function isTicketOverdue(dueAt: string, status: string) {
  return status !== "completed" && status !== "cancelled" && new Date(dueAt).getTime() < Date.now();
}
