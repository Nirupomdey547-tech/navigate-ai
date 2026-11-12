import type { Metadata } from "next";
import "./globals.css";
import AmbientBackground from "@/components/ui/AmbientBackground";

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
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white/20 relative">
        <AmbientBackground />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
