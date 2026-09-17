import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Store App",
    template: "%s | Store App",
  },
  description: "Store Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Sidebar />

        <div className="ml-64 min-h-screen">
          <Navbar />

          <main className="pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}