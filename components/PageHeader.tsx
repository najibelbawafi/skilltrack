"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PageHeader() {
  const pathname = usePathname();

  const isDirectoryDetail =
    pathname.startsWith("/directory/") &&
    pathname !== "/directory/";

  const backHref = isDirectoryDetail
    ? "/directory"
    : "/dashboard";

  const backLabel = isDirectoryDetail
    ? "Kembali ke Direktori Siswa"
    : "Kembali ke Dashboard";

  return (
    <header className="relative z-50 w-full border-b border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href={backHref}
          className="relative z-50 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50 hover:text-blue-800 sm:text-base"
        >
          <ArrowLeft size={20} />
          {backLabel}
        </Link>

        <Link
          href="/"
          aria-label="SkillTrack - Home"
          className="relative z-50 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#0756A5] transition hover:text-blue-800 sm:text-2xl"
        >
          <Image
            src="/skilltrack-icon.svg"
            alt=""
            width={36}
            height={36}
            priority
            className="rounded-xl"
          />
          SkillTrack
        </Link>
      </div>
    </header>
  );
}