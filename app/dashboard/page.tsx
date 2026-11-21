
"use client";

import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Award,
  Trophy,
  Settings,
  LogOut,
  Menu,
  Eye,
  Users,
  X,
  FileText,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";

type DashboardSummary = {
  profileComplete: boolean;
  projects: number;
  certificates: number;
  achievements: number;
};

const initialSummary: DashboardSummary = {
  profileComplete: false,
  projects: 0,
  certificates: 0,
  achievements: 0,
};

const pageTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

const menus = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Profil Saya", icon: User, href: "/profile" },
  { label: "Proyek Saya", icon: FolderKanban, href: "/projects" },
  { label: "Sertifikat", icon: Award, href: "/certificates" },
  { label: "Pencapaian", icon: Trophy, href: "/achievements" },
  { label: "CV Saya", icon: FileText, href: "/dashboard/cv" },
  { label: "Preview Portofolio", icon: Eye, href: "/portfolio" },
  { label: "Direktori Siswa", icon: Users, href: "/directory" },
  { label: "Pengaturan", icon: Settings, href: "/settings" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#0756A5]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-[#25364A]">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function UserAvatar({ name, size = "normal" }: { name: string; size?: "normal" | "small" }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0756A5] ${
        size === "small" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {initial}
    </div>
  );
}

function NavigationMenu({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto">
      {menus.map((menu, index) => {
        const Icon = menu.icon;
        const active = index === 0;

        return (
          <Link
            key={menu.label}
            href={menu.href}
            onClick={onNavigate}
            className={`relative flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
              active
                ? "border border-blue-100 bg-blue-50 font-semibold text-[#0756A5]"
                : "border border-transparent text-slate-500 hover:border-slate-100 hover:bg-slate-50 hover:text-[#0756A5]"
            }`}
          >
            {active && (
              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#0756A5]" />
            )}
            <Icon size={18} className="shrink-0" />
            <span>{menu.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserAccount({
  name,
  onLogout,
  logoutLoading,
}: {
  name: string;
  onLogout: () => void;
  logoutLoading: boolean;
}) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <UserAvatar name={name} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#25364A]">
            {name}
          </p>
          <p className="truncate text-xs text-slate-400">
            Akun SkillTrack
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={logoutLoading}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut size={18} />
        {logoutLoading ? "Keluar..." : "Keluar"}
      </button>
    </>
  );
}

function ContentCard({
  icon: Icon,
  title,
  description,
  href,
  buttonLabel,
}: {
  icon: ElementType;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}) {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
            <Icon size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-[#25364A]">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {buttonLabel}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </motion.section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  loading,
  index,
}: {
  label: string;
  value: string;
  icon: ElementType;
  loading: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...pageTransition, delay: 0.12 + index * 0.07 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-5 break-words text-2xl font-bold tracking-tight text-[#25364A]">
        {loading ? (
          <span className="inline-block h-7 w-24 animate-pulse rounded-lg bg-slate-200" />
        ) : (
          value
        )}
      </p>
    </motion.div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...pageTransition, delay: 0.15 + index * 0.06 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5] transition-colors group-hover:bg-[#0756A5] group-hover:text-white">
            <Icon size={20} />
          </div>

          <ArrowUpRight
            size={17}
            className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0756A5]"
          />
        </div>

        <h3 className="mt-5 text-sm font-bold text-[#25364A]">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const userId = user?.id ?? null;
  const userName = user?.name || "Siswa";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    async function loadDashboardSummary() {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const [
          profileResult,
          projectsResult,
          certificatesResult,
          achievementsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .maybeSingle(),

          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),

          supabase
            .from("certificates")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),

          supabase
            .from("achievements")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

        if (!mounted) return;

        const errors = [
          profileResult.error,
          projectsResult.error,
          certificatesResult.error,
          achievementsResult.error,
        ].filter(Boolean);

        setSummary({
          profileComplete: Boolean(profileResult.data?.full_name?.trim()),
          projects: projectsResult.count ?? 0,
          certificates: certificatesResult.count ?? 0,
          achievements: achievementsResult.count ?? 0,
        });

        if (errors.length > 0) {
          console.error("Gagal memuat ringkasan dashboard:", errors);
          setSummaryError(
            "Sebagian ringkasan belum berhasil dimuat. Silakan muat ulang halaman."
          );
        }
      } catch (err) {
        console.error("Gagal memuat ringkasan dashboard:", err);

        if (mounted) {
          setSummaryError(
            "Ringkasan belum berhasil dimuat. Silakan muat ulang halaman."
          );
        }
      } finally {
        if (mounted) {
          setSummaryLoading(false);
        }
      }
    }

    loadDashboardSummary();

    return () => {
      mounted = false;
    };
  }, [userId]);

  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);

    const { error } = await signOut();

    if (error) {
      console.error("Logout gagal:", error);
      setLogoutLoading(false);
      return;
    }

    router.replace("/login");
  }

  if (loading || !user || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-[#0756A5]" />
          <p className="text-sm font-medium text-slate-500">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  const summaryItems = [
    {
      label: "Profil Saya",
      value: summary.profileComplete ? "Sudah diisi" : "Belum diisi",
      icon: User,
    },
    {
      label: "Proyek",
      value: summary.projects.toString(),
      icon: FolderKanban,
    },
    {
      label: "Sertifikat",
      value: summary.certificates.toString(),
      icon: Award,
    },
    {
      label: "Pencapaian",
      value: summary.achievements.toString(),
      icon: Trophy,
    },
  ];

  const quickLinks = [
    {
      title: "Lengkapi Profil",
      description: "Perbarui informasi diri dan pendidikan.",
      href: "/profile",
      icon: User,
    },
    {
      title: "Kelola Proyek",
      description: "Dokumentasikan proyek yang pernah dibuat.",
      href: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Kelola Sertifikat",
      description: "Simpan bukti kompetensi dan pelatihan.",
      href: "/certificates",
      icon: Award,
    },
    {
      title: "Kelola Pencapaian",
      description: "Tambahkan prestasi dan penghargaan.",
      href: "/achievements",
      icon: Trophy,
    },
  ];

  const mobileMenuItems: ReactNode = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3"
        >
          <Image
            src="/skilltrack-icon.svg"
            alt="SkillTrack"
            width={40}
            height={40}
            priority
            className="rounded-xl"
          />
          <span className="text-lg font-bold text-[#0756A5]">
            SkillTrack
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400">
        MENU UTAMA
      </p>

      <NavigationMenu onNavigate={() => setMobileMenuOpen(false)} />

      <div className="my-4 h-px bg-slate-200" />

      <UserAccount
        name={userName}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
      />
    </>
  );

  return (
    <main className="min-h-screen bg-[#F4F7FB] md:flex">
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={pageTransition}
        className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white p-5 md:flex lg:w-[270px] lg:p-6"
      >
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/skilltrack-icon.svg"
            alt="SkillTrack"
            width={44}
            height={44}
            priority
            className="rounded-xl transition-transform duration-300 group-hover:scale-105"
          />

          <div>
            <p className="text-xl font-bold tracking-tight text-[#0756A5]">
              SkillTrack
            </p>
            <p className="text-[10px] font-medium tracking-[0.16em] text-slate-400">
              STUDENT PLATFORM
            </p>
          </div>
        </Link>

        <div className="mb-3 mt-10 px-3">
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
            MENU UTAMA
          </p>
        </div>

        <NavigationMenu />

        <div className="my-5 h-px bg-slate-200" />

        <UserAccount
          name={userName}
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
        />
      </motion.aside>

      {/* MAIN CONTENT */}
      <section className="min-w-0 flex-1">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl sm:px-8"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold text-[#25364A] sm:text-base">
                Dashboard
              </p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Ringkasan aktivitas portofolio kamu
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 sm:px-3"
          >
            <UserAvatar name={userName} size="small" />
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-600 sm:block">
              {userName}
            </span>
          </Link>
        </motion.header>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm md:hidden"
                aria-label="Tutup menu"
              />

              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={pageTransition}
                className="fixed inset-y-0 left-0 z-[60] flex w-[290px] max-w-[85vw] flex-col border-r border-gray-200 bg-white p-5 shadow-2xl md:hidden"
              >
                {mobileMenuItems}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* DASHBOARD CONTENT */}
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-8 sm:py-9">
          {/* WELCOME */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={pageTransition}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0756A5] to-[#1674C5] p-6 shadow-sm sm:rounded-3xl sm:p-9"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-36 right-1/3 h-64 w-64 rounded-full border-[35px] border-white/10" />

            <div className="relative z-10 max-w-2xl">
              <p className="text-[10px] font-bold tracking-[0.18em] text-blue-100">
                STUDENT PORTFOLIO PLATFORM
              </p>

              <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Selamat datang, {userName}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
                Bangun portofolio digitalmu, dokumentasikan pengalaman, dan
                tunjukkan keterampilan yang sudah kamu kembangkan.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/portfolio"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0756A5] shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Lihat Portofolio
                  <ArrowUpRight size={17} />
                </Link>

                <Link
                  href="/profile"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Perbarui Profil
                </Link>
              </div>
            </div>
          </motion.section>

          {/* SUMMARY */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.08 }}
          >
            <SectionHeading
              eyebrow="OVERVIEW"
              title="Ringkasan Portofolio"
            />

            {summaryError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {summaryError}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryItems.map((item, index) => (
                <SummaryCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  loading={summaryLoading}
                  index={index}
                />
              ))}
            </div>
          </motion.section>

          {/* QUICK ACTIONS */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.16 }}
            className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <SectionHeading
              eyebrow="QUICK ACTIONS"
              title="Kelola Portofolio"
              description="Pilih bagian yang ingin kamu perbarui."
            />

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map((item, index) => (
                <QuickAction
                  key={item.title}
                  {...item}
                  index={index}
                />
              ))}
            </div>
          </motion.section>

          {/* PORTFOLIO PREVIEW */}
          <ContentCard
            icon={Eye}
            title="Preview Portofolio"
            description="Lihat tampilan profil digital yang berisi data pendidikan, proyek, sertifikat, dan pencapaianmu."
            href="/portfolio"
            buttonLabel="Lihat Portofolio"
          />

          {/* CV PREVIEW */}
          <ContentCard
            icon={FileText}
            title="Preview CV"
            description="Lihat CV digital berdasarkan informasi profil, keterampilan, proyek, dan pencapaianmu."
            href={`/directory/${userId}/cv`}
            buttonLabel="Lihat CV"
          />

          {/* DIRECTORY */}
          <ContentCard
            icon={Users}
            title="Direktori Siswa"
            description="Jelajahi profil dan karya siswa lain yang telah mempublikasikan portofolio mereka."
            href="/directory"
            buttonLabel="Jelajahi Direktori"
          />

          {/* FOOTER */}
          <footer className="pb-3 pt-2 text-center text-xs text-slate-400">
            SkillTrack · Student Portfolio Platform
          </footer>
        </div>
      </section>
    </main>
  );
}
