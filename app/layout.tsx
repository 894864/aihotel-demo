import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "AIHOTEL 客需工单看板",
  description: "酒店客需工单实时看板 Demo",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#12324a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
