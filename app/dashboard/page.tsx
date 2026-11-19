
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const userId = user?.id ?? null;

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
        profileComplete: Boolean(
          profileResult.data?.full_name?.trim()
        ),
        projects: projectsResult.count ?? 0,
        certificates: certificatesResult.count ?? 0,
        achievements: achievementsResult.count ?? 0,
      });

      if (errors.length > 0) {
        console.error("Gagal memuat ringkasan dashboard:", errors);
        setSummaryError(
          "Sebagian ringkasan belum berhasil dimuat. Coba muat ulang halaman."
        );
      }

      setSummaryLoading(false);
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
      <main className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl px-6 py-4 text-sm text-gray-500"
        >
          Memuat dashboard...
        </motion.div>
      </main>
    );
  }

  const menus = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Profil Saya", icon: User, href: "/profile" },
    { label: "Proyek Saya", icon: FolderKanban, href: "/projects" },
    { label: "Sertifikat", icon: Award, href: "/certificates" },
    { label: "Pencapaian", icon: Trophy, href: "/achievements" },
    { label: "CV Saya", icon: FileText, href: "/dashboard/cv" },
    { label: "Preview Portofolio", icon: Eye, href: "/portfolio" },
    {
      label: "Preview CV",
      icon: FileText,
      href: `/directory/${userId}/cv`,
    },
    { label: "Direktori Siswa", icon: Users, href: "/directory" },
    { label: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  const summaryItems = [
    {
      label: "Profil Saya",
      value: summary.profileComplete ? "Sudah diisi" : "Belum diisi",
      icon: User,
      color: "text-blue-600",
      iconBg: "bg-blue-100/70",
    },
    {
      label: "Proyek",
      value: summary.projects.toString(),
      icon: FolderKanban,
      color: "text-indigo-600",
      iconBg: "bg-indigo-100/70",
    },
    {
      label: "Sertifikat",
      value: summary.certificates.toString(),
      icon: Award,
      color: "text-amber-600",
      iconBg: "bg-amber-100/70",
    },
    {
      label: "Pencapaian",
      value: summary.achievements.toString(),
      icon: Trophy,
      color: "text-emerald-600",
      iconBg: "bg-emerald-100/70",
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

  return (
    <main className="min-h-screen md:flex">
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={pageTransition}
        className="glass-strong sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col border-r border-white/70 p-6 md:flex"
      >
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0756A5] text-white shadow-lg shadow-blue-900/15 transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-105">
            <LayoutDashboard size={22} />
          </div>

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

        <nav className="flex-1 space-y-1.5">
          {menus.map((menu, index) => {
            const Icon = menu.icon;
            const active = index === 0;

            return (
              <motion.div
                key={menu.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={menu.href}
                  className={`relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                    active
                      ? "border border-blue-100/80 bg-blue-50/80 font-semibold text-[#0756A5] shadow-sm"
                      : "border border-transparent text-slate-500 hover:border-white/80 hover:bg-white/65 hover:text-[#0756A5]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dashboard-active-indicator"
                      className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#0756A5]"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon size={18} className="shrink-0" />
                  <span>{menu.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="my-5 h-px bg-slate-200/60" />

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#0756A5]">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#25364A]">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-400">
              Akun SkillTrack
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50/80 disabled:opacity-60"
        >
          <LogOut size={18} />
          {logoutLoading ? "Keluar..." : "Keluar"}
        </motion.button>
      </motion.aside>

      {/* MAIN CONTENT */}
      <section className="min-w-0 flex-1">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
          className="glass-strong sticky top-0 z-40 flex min-h-[76px] items-center justify-between gap-3 border-b border-white/70 px-4 py-4 sm:px-6 md:px-8"
        >
          <div className="flex min-w-0 items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 md:hidden"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.16 }}
                  className="flex"
                >
                  {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">
                WORKSPACE
              </p>
              <h1 className="truncate text-lg font-bold text-[#25364A]">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-semibold text-[#25364A]">
                {user.name}
              </p>
              <p className="max-w-[180px] truncate text-xs text-slate-400">
                {user.email}
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.07, rotate: 4 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-gradient-to-br from-blue-100 to-blue-200 font-bold text-[#0756A5] shadow-sm"
            >
              {user.name.charAt(0).toUpperCase()}
            </motion.div>
          </div>
        </motion.header>

        {/* MOBILE NAVIGATION */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="glass-strong relative z-30 overflow-hidden border-b border-white/70 p-4 md:hidden"
            >
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                MENU NAVIGASI
              </p>

              <nav className="space-y-1">
                {menus.map((menu, index) => {
                  const Icon = menu.icon;

                  return (
                    <motion.div
                      key={menu.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.025 }}
                    >
                      <Link
                        href={menu.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                          index === 0
                            ? "bg-blue-50/90 font-semibold text-[#0756A5]"
                            : "text-slate-600 hover:bg-white/70 hover:text-[#0756A5]"
                        }`}
                      >
                        <Icon size={18} />
                        {menu.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50/80 disabled:opacity-60"
                >
                  <LogOut size={18} />
                  {logoutLoading ? "Keluar..." : "Keluar"}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGE CONTENT */}
        <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 md:space-y-9 md:p-8 lg:p-10">
          {/* HERO */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.08 }}
            className="relative isolate overflow-hidden rounded-[28px] border border-white/30 bg-gradient-to-br from-[#0756A5] via-[#1269B9] to-[#3B91D7] p-6 text-white shadow-[0_20px_60px_rgba(7,86,165,0.18)] sm:p-8 md:p-10"
          >
            <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border border-white/15 bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 -z-10 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-blue-50 backdrop-blur-xl sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                STUDENT DASHBOARD
              </div>

              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                Selamat datang,
                <br className="hidden sm:block" /> {user.name}!
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/90 sm:text-base">
                Mulai bangun portofolio digital dengan mengelola informasi
                diri, keterampilan, proyek, dan pencapaianmu.
              </p>

              <motion.div
                whileHover={{ scale: 1.035 }}
                whileTap={{ scale: 0.97 }}
                className="mt-7 inline-flex"
              >
                <Link
                  href="/portfolio"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/40 bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30"
                >
                  Lihat Portofolio
                  <ArrowUpRight size={17} />
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* SUMMARY */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.16 }}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#0756A5]">
                  OVERVIEW
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#25364A] sm:text-2xl">
                  Ringkasan Portofolio
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pantau perkembangan portofolio digitalmu.
                </p>
              </div>
            </div>

            {summaryError && (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-600">
                {summaryError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
              {summaryItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 22, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      ...pageTransition,
                      delay: 0.2 + index * 0.08,
                    }}
                    whileHover={{ y: -5, scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    className="glass-card min-w-0 p-5 sm:p-6"
                  >
                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500">
                        {item.label}
                      </p>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.color}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="relative z-10 mt-5 break-words text-2xl font-bold tracking-tight text-[#25364A]">
                      {summaryLoading ? (
                        <span className="inline-block h-7 w-24 animate-pulse rounded-lg bg-slate-200/70" />
                      ) : (
                        item.value
                      )}
                    </p>

                    <div className="relative z-10 mt-4 h-1 overflow-hidden rounded-full bg-slate-200/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 0.8,
                          delay: 0.35 + index * 0.08,
                        }}
                        className={`h-full rounded-full ${item.color.replace("text-", "bg-")}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* QUICK ACTIONS */}
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.3 }}
            className="glass rounded-[26px] p-5 sm:p-7"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#0756A5]">
                  QUICK ACTIONS
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#25364A]">
                  Kelola Portofolio
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pilih bagian yang ingin kamu perbarui.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...pageTransition,
                      delay: 0.35 + index * 0.07,
                    }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className="group flex h-full flex-col rounded-2xl border border-white/80 bg-white/55 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-blue-200 hover:bg-white/85 hover:shadow-lg hover:shadow-blue-900/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5] transition duration-300 group-hover:scale-110 group-hover:bg-[#0756A5] group-hover:text-white">
                          <Icon size={20} />
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0756A5]"
                        />
                      </div>

                      <h3 className="mt-5 text-sm font-bold text-[#25364A]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* PREVIEW PORTFOLIO */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.4 }}
            whileHover={{ y: -3 }}
            className="glass-card p-5 sm:p-7"
          >
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100/80 text-[#0756A5]">
                  <Eye size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-[#25364A]">
                    Preview Portofolio
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Lihat tampilan profil digital yang berisi data pendidikan,
                    proyek, sertifikat, dan pencapaianmu.
                  </p>
                </div>
              </div>

              <Link
                href="/portfolio"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Lihat Portofolio
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </motion.section>

          {/* PREVIEW CV */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.46 }}
            whileHover={{ y: -3 }}
            className="glass-card p-5 sm:p-7"
          >
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100/80 text-indigo-700">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-[#25364A]">
                    Preview CV
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Lihat CV digital berdasarkan informasi profil,
                    keterampilan, proyek, dan pencapaianmu.
                  </p>
                </div>
              </div>

              <Link
                href={`/directory/${userId}/cv`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Lihat CV
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </motion.section>

          {/* DIRECTORY */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...pageTransition, delay: 0.52 }}
            whileHover={{ y: -3 }}
            className="glass-card p-5 sm:p-7"
          >
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-700">
                  <Users size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-[#25364A]">
                    Direktori Siswa
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Jelajahi profil dan karya siswa lain yang telah
                    mempublikasikan portofolio mereka.
                  </p>
                </div>
              </div>

              <Link
                href="/directory"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Jelajahi Direktori
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </motion.section>

          {/* FOOTER */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="pb-3 pt-2 text-center text-xs text-slate-400"
          >
            SkillTrack · Student Portfolio Platform
          </motion.footer>
        </div>
      </section>
    </main>
  );
}
