import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "Hospital Ward Assistant - Voice-Enabled Patient Care",
  description: "Real-time patient monitoring and voice-controlled hospital management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
