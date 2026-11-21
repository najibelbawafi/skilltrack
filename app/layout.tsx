
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillTrack | Student Portfolio Platform",
    template: "%s | SkillTrack",
  },
  applicationName: "SkillTrack",
  description:
    "SkillTrack adalah platform portofolio digital siswa untuk mendokumentasikan pendidikan, keterampilan, proyek, sertifikat, prestasi, dan pengalaman.",
  keywords: [
    "SkillTrack",
    "Student Portfolio",
    "Student Directory",
    "Portofolio Siswa",
    "Pengembangan Keterampilan",
  ],
  icons: {
    icon: "/skilltrack-icon.svg",
    shortcut: "/skilltrack-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
