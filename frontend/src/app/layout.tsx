import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shree Balaji Traders | Electrical Contractor Project & Operations Management",
  description: "Shree Balaji Traders CRM is a professional, full-scale project management and client relationship system designed specifically for utility-grade electrical infrastructure, DHBVN projects, substation construction, and high-tension transmission grid contracting.",
  keywords: ["electrical contractor", "CRM", "project management", "DHBVN", "utility maintenance", "electrical infrastructure", "transformer installation", "HT line erection"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
