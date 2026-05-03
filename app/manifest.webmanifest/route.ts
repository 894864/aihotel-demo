import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "AIHOTEL 客需工单看板",
    short_name: "AIHOTEL",
    description: "酒店客需工单看板 PWA Demo",
    start_url: "/frontdesk",
    scope: "/",
    display: "standalone",
    background_color: "#f8f3e8",
    theme_color: "#12324a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  });
}
