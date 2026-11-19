import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0756A5] transition hover:text-blue-800 sm:text-base"
        >
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </Link>

        <Link
          href="/"
          aria-label="SkillTrack - Home"
          className="text-xl font-bold tracking-tight text-[#0756A5] transition hover:text-blue-800 sm:text-2xl"
        >
          SkillTrack
        </Link>
      </div>
    </header>
  );
}