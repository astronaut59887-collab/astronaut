import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans-sc";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarMate · 你的宇宙搭子",
  description: "一个会记得你、陪你成长的外星 AI 伙伴。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090b1f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
