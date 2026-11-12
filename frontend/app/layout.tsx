import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navigate AI | Multilingual Vision-and-Language Navigation Platform",
  description: "Language is the destination. Intelligence is the path. Research-grade Multilingual Vision-and-Language Navigation Decision Agent for the Google Research RxR Challenge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0A0D10] text-[#F4F7F8] selection:bg-[#63E6D1]/20">
        {children}
      </body>
    </html>
  );
}
