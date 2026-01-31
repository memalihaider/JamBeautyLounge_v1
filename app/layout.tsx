import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "JAM Beauty Lounge Management System",
  description: "JAM Beauty Lounge booking and management system",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans transition-all duration-300"
        style={{ fontFamily: "'Aptos', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
      >
        <Providers>
          <div className="page-transition">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
