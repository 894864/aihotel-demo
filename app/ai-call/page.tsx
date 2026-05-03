"use client";

import { addMinutes } from "date-fns";
import { Bot, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PriorityBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTickets } from "@/hooks/use-tickets";
import { parseGuestCall } from "@/lib/ai-parser";
import { departmentLabels, slaMinutes } from "@/lib/constants";
import type { Department, Priority } from "@/lib/types";

const examples = [
  { label: "客房部", text: "我是1208房，麻烦送两条浴巾和两瓶矿泉水。" },
  { label: "工程部", text: "我是1602房，空调不制冷，麻烦马上安排维修。" },
  { label: "前台", text: "我是608房，需要开发票，顺便帮我叫车。" },
  { label: "餐饮部", text: "我是706房，早餐想送到房间，再要一杯咖啡。" },
  { label: "投诉", text: "我是1003房，隔壁噪音严重，我要投诉找经理。" },
  { label: "紧急", text: "我是805房，有客人受伤了，需要报警。" }
];

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "low", label: "低" },
  { value: "normal", label: "普通" },
  { value: "high", label: "加急" },
  { value: "urgent", label: "紧急" }
];

export default function AiCallPage() {
  const [text, setText] = useState(examples[1].text);
  const { createTicket, message, mode } = useTickets();
  const parsed = useMemo(() => parseGuestCall(text), [text]);
  const [room, setRoom] = useState(parsed.room);
  const [request, setRequest] = useState(parsed.request);
  const [department, setDepartment] = useState<Department>(parsed.department);
  const [priority, setPriority] = useState<Priority>(parsed.priority);
  const [sla, setSla] = useState(slaMinutes[parsed.priority]);

  useEffect(() => {
    setRoom(parsed.room);
    setRequest(parsed.request);
    setDepartment(parsed.department);
    setPriority(parsed.priority);
    setSla(slaMinutes[parsed.priority]);
  }, [parsed]);

  async function submitTicket() {
    await createTicket({
      room,
      request,
      department,
      priority,
      source: "ai_call",
      due_at: addMinutes(new Date(), Math.max(1, sla)).toISOString(),
      notes: `原始来电文本：${text}；人工确认 SLA：${sla} 分钟`
    });
  }

  return (
    <AppShell title="AI 来电模拟" eyebrow={mode === "supabase" ? "规则识别 + Supabase 入库" : "规则识别 + 本地入库"}>
      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Card className="bg-white/85">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-amber-700" />
              客人电话文本
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="我是805房，麻烦送两瓶水和一条浴巾，尽快，谢谢。"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <Button key={example.label} variant="outline" onClick={() => setText(example.text)}>
                  {example.label}
                </Button>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-slate-950/5 p-4 text-sm font-bold text-slate-700">
              {message ?? "第一版使用本地关键词规则识别，不接真实大模型，不接讯飞。真实落地时可接讯飞电话转写文本。"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <CardTitle>识别结果与人工确认</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="房号">
              <Input value={room} onChange={(event) => setRoom(event.target.value)} className="text-slate-950" />
            </Field>
            <Field label="需求">
              <Input value={request} onChange={(event) => setRequest(event.target.value)} className="text-slate-950" />
            </Field>
            <Field label="部门">
              <Select value={department} onChange={(event) => setDepartment(event.target.value as Department)} className="text-slate-950">
                {Object.entries(departmentLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="优先级">
              <Select
                value={priority}
                onChange={(event) => {
                  const next = event.target.value as Priority;
                  setPriority(next);
                  setSla(slaMinutes[next]);
                }}
                className="text-slate-950"
              >
                {priorityOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="SLA / 超时时间（分钟）">
              <Input
                type="number"
                min={1}
                value={sla}
                onChange={(event) => setSla(Number(event.target.value))}
                className="text-slate-950"
              />
            </Field>
            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
              <span className="text-white/60">当前优先级</span>
              <PriorityBadge priority={priority} />
            </div>
            <Preview label="来源" value="AI 来电" />
            <Button onClick={submitTicket} disabled={!text.trim() || !room.trim() || !request.trim()} className="w-full" size="lg">
              <Send className="h-4 w-4" />
              确认生成工单
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl bg-white/10 p-4">
      <span className="mb-2 block text-sm text-white/60">{label}</span>
      {children}
    </label>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
