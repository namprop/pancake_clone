import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hupunacake Mini CRM",
  description: "Quản lý bán hàng đa kênh — Facebook Inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full h-full">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
