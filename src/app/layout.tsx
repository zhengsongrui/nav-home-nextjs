import type { Metadata } from "next";
import "@/styles/globals.scss";
import Helper from "@/components/Helper/Helper";


export const metadata: Metadata = {
  title: "个人技术主页",
  description: "个人技术主页",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        {children}
        {/* 全站悬浮 AI 助手 */}
        <Helper />
      </body>
    </html>
  );
}
