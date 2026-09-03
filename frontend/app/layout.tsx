import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOOP | Customer Feedback Intelligence Platform",
  description: "Enterprise feedback tracking and sentiment classification platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}