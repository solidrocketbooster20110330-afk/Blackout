import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLACKOUT // Terminal",
  description: "A fictional cyber intelligence mission simulator.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
