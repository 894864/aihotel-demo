"use client";

import { Smartphone } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TicketCard } from "@/components/ticket-card";
import { Select } from "@/components/ui/select";
import { useTickets } from "@/hooks/use-tickets";
import { departmentLabels, staffMembers } from "@/lib/constants";

export default function StaffPage() {
  const [staffId, setStaffId] = useState(staffMembers[0].id);
  const { tickets, updateStatus, message, mode } = useTickets();
  const staff = staffMembers.find((item) => item.id === staffId) ?? staffMembers[0];
  const visibleTickets = tickets.filter(
    (ticket) =>
      ticket.department === staff.department &&
      ticket.status !== "completed" &&
      ticket.status !== "cancelled"
  );

  return (
    <AppShell title="员工手机端" eyebrow={mode === "supabase" ? "实时同步" : "本地 Demo 同步"}>
      <div className="mx-auto max-w-md">
        <div className="mb-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-panel">
          <div className="mb-4 flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-amber-300" />
            <div>
              <p className="text-sm text-white/60">当前员工身份</p>
              <p className="text-xl font-black">{staff.name} · {departmentLabels[staff.department]}</p>
            </div>
          </div>
          <Select value={staffId} onChange={(event) => setStaffId(event.target.value)} className="text-slate-950">
            {staffMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} / {departmentLabels[member.department]} / {member.role}
              </option>
            ))}
          </Select>
        </div>
        <p className="mb-4 rounded-2xl bg-white/75 p-4 text-sm font-bold text-slate-700">
          {message ?? "只显示当前员工所属部门的未完成工单。接单和完成后前台会实时更新。"}
        </p>
        <section className="space-y-4">
          {visibleTickets.length ? (
            visibleTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                staff={staff}
                compact
                onAccept={(item) => updateStatus(item.id, "accepted", staff)}
                onComplete={(item) => updateStatus(item.id, "completed", staff)}
              />
            ))
          ) : (
            <div className="rounded-3xl bg-white/80 p-8 text-center font-bold text-slate-600">当前部门暂无待处理工单</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
