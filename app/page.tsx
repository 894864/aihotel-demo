import Link from "next/link";
import { ArrowRight } from "lucide-react";

const pages = [
  { href: "/frontdesk", title: "前台看板", desc: "大屏实时工单状态总览" },
  { href: "/staff", title: "员工手机端", desc: "选择身份、接单、完成" },
  { href: "/manager", title: "主管看板", desc: "今日数据与员工排行" },
  { href: "/ai-call", title: "AI 来电模拟", desc: "本地规则识别并生成工单" }
];

export default function HomePage() {
  return (
    <main className="hotel-grid min-h-screen p-6">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.34em] text-amber-700">AIHOTEL Demo</p>
        <h1 className="font-display text-5xl font-bold leading-tight text-slate-900 md:text-7xl">
          酒店客需工单工作台
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          演示客人需求进入系统后，前台、员工、主管如何实时看到接单、处理、完成和超时状态。
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="glass-panel group rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{page.title}</h2>
                <ArrowRight className="h-5 w-5 text-amber-700 transition group-hover:translate-x-1" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{page.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
