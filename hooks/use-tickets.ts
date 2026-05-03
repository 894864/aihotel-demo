"use client";

import { addMinutes } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { staffMembers, slaMinutes } from "@/lib/constants";
import { demoTickets } from "@/lib/demo-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { StaffMember, Ticket, TicketCreateInput, TicketStatus } from "@/lib/types";

const STORAGE_KEY = "aihotel-demo-tickets";
const CHANNEL = "aihotel-demo-ticket-updates";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadLocal = useCallback(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const next = raw ? (JSON.parse(raw) as Ticket[]) : demoTickets;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTickets(applyTimeouts(next));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      loadLocal();
      const bc = new BroadcastChannel(CHANNEL);
      bc.onmessage = loadLocal;
      const timer = window.setInterval(() => setTickets((prev) => applyTimeouts(prev)), 30_000);
      return () => {
        bc.close();
        window.clearInterval(timer);
      };
    }

    const client = supabase;
    let active = true;
    client
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setTickets(applyTimeouts((data ?? []) as Ticket[]));
          setLoading(false);
        }
      });

    const channel = client
      .channel("tickets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, async () => {
        const { data } = await client.from("tickets").select("*").order("created_at", { ascending: false });
        setTickets(applyTimeouts((data ?? []) as Ticket[]));
      })
      .subscribe();

    const timer = window.setInterval(() => setTickets((prev) => applyTimeouts(prev)), 30_000);
    return () => {
      active = false;
      client.removeChannel(channel);
      window.clearInterval(timer);
    };
  }, [loadLocal]);

  const persistLocal = useCallback((next: Ticket[], feedback: string) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTickets(applyTimeouts(next));
    setMessage(feedback);
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage("changed");
    bc.close();
  }, []);

  const createTicket = useCallback(
    async (input: TicketCreateInput) => {
      const now = new Date();
      const ticket: Ticket = {
        id: crypto.randomUUID(),
        room: input.room,
        request: input.request,
        department: input.department,
        source: input.source,
        status: "pending",
        priority: input.priority,
        assignee_id: null,
        assignee_name: null,
        created_at: now.toISOString(),
        accepted_at: null,
        completed_at: null,
        due_at: input.due_at ?? addMinutes(now, slaMinutes[input.priority]).toISOString(),
        notes: input.notes ?? null
      };

      if (hasSupabaseConfig && supabase) {
        const { error } = await supabase.from("tickets").insert(ticket as never);
        setMessage(error ? `创建失败：${error.message}` : `已生成 ${ticket.room} 房工单`);
        return !error;
      }

      persistLocal([ticket, ...tickets], `已生成 ${ticket.room} 房工单`);
      return true;
    },
    [persistLocal, tickets]
  );

  const updateStatus = useCallback(
    async (id: string, status: TicketStatus, staff?: StaffMember) => {
      const now = new Date().toISOString();
      const patch: Partial<Ticket> = { status };
      if (status === "accepted" || status === "processing") {
        patch.accepted_at = now;
        patch.assignee_id = staff?.id ?? null;
        patch.assignee_name = staff?.name ?? null;
      }
      if (status === "completed") {
        patch.completed_at = now;
      }

      if (hasSupabaseConfig && supabase) {
        const { error } = await supabase.from("tickets").update(patch as never).eq("id", id);
        setMessage(error ? `操作失败：${error.message}` : "状态已同步到前台看板");
        return !error;
      }

      const next = tickets.map((ticket) => (ticket.id === id ? { ...ticket, ...patch } : ticket));
      persistLocal(next, "状态已同步到前台看板");
      return true;
    },
    [persistLocal, tickets]
  );

  const resetDemo = useCallback(() => {
    persistLocal(demoTickets, "演示数据已重置");
  }, [persistLocal]);

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [tickets]
  );

  return {
    tickets: sortedTickets,
    loading,
    message,
    mode: hasSupabaseConfig ? "supabase" : "local",
    createTicket,
    updateStatus,
    resetDemo,
    staffMembers
  };
}

function applyTimeouts(tickets: Ticket[]) {
  return tickets.map((ticket) => {
    if (ticket.status === "completed" || ticket.status === "cancelled") return ticket;
    if (new Date(ticket.due_at).getTime() < Date.now()) return { ...ticket, status: "timeout" as const };
    return ticket;
  });
}
