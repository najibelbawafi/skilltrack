
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader() {
  return (
    <header className="relative z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/dashboard"
          className="relative z-50 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50 hover:text-blue-800 sm:text-base"
        >
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </Link>

        <Link
          href="/"
          aria-label="SkillTrack - Home"
          className="relative z-50 text-xl font-bold tracking-tight text-[#0756A5] transition hover:text-blue-800 sm:text-2xl"
        >
          SkillTrack
        </Link>
      </div>
    </header>
  );
}
