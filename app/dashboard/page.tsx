
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

import { getCurrentUser, logoutUser } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";

function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAuthSnapshot() {
  return localStorage.getItem("skilltrack_current_user");
}

function getServerAuthSnapshot() {
  return undefined;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userId = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const user = userId ? getCurrentUser() : null;
  const profile = userId ? getStudentProfile(userId) : null;
  const projects = userId ? getStudentProjects(userId) : [];
  const certificates = userId ? getStudentCertificates(userId) : [];
  const achievements = userId ? getStudentAchievements(userId) : [];

  useEffect(() => {
    if (userId === null || (userId && !user)) {
      router.replace("/login");
    }
  }, [userId, router, user]);

  function handleLogout() {
    logoutUser();
    router.replace("/login");
  }

  if (userId === undefined || userId === null || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat dashboard...</p>
      </main>
    );
  }

  const menus = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Profil Saya", icon: User, href: "/profile" },
    { label: "Proyek Saya", icon: FolderKanban, href: "/projects" },
    { label: "Sertifikat", icon: Award, href: "/certificates" },
    { label: "Pencapaian", icon: Trophy, href: "/achievements" },
    { label: "Preview Portofolio", icon: Eye, href: "/portfolio" },
    { label: "Direktori Siswa", icon: Users, href: "/directory" },
    { label: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  const summary = [
    {
      label: "Profil Saya",
      value: profile?.fullName ? "Sudah diisi" : "Belum diisi",
      icon: User,
    },
    {
      label: "Proyek",
      value: projects.length.toString(),
      icon: FolderKanban,
    },
    {
      label: "Sertifikat",
      value: certificates.length.toString(),
      icon: Award,
    },
    {
      label: "Pencapaian",
      value: achievements.length.toString(),
      icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F4F7FB] md:flex">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-6 md:flex">
        <Link href="/" className="text-2xl font-bold text-[#0756A5]">
          SkillTrack
        </Link>

        <p className="mb-8 mt-2 text-xs text-gray-400">
          STUDENT PORTFOLIO PLATFORM
        </p>

        <nav className="space-y-1.5">
          {menus.map((menu, index) => {
            const Icon = menu.icon;

            return (
              <Link
                key={menu.label}
                href={menu.href}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  index === 0
                    ? "bg-blue-50 font-semibold text-[#0756A5]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0756A5]"
                }`}
              >
                <Icon size={19} className="shrink-0" />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={19} />
          Keluar
        </button>
      </aside>

      {/* Konten Utama */}
      <section className="min-w-0 flex-1">
        {/* Header */}
        <header className="relative flex min-h-[72px] items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <h1 className="truncate text-lg font-bold text-[#25364A]">
              Dashboard
            </h1>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <p className="max-w-[130px] truncate text-sm font-semibold text-[#25364A] sm:max-w-none">
                {user.name}
              </p>
              <p className="hidden max-w-[180px] truncate text-xs text-gray-500 sm:block">
                {user.email}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0756A5] sm:h-10 sm:w-10">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Navigasi Mobile */}
        {mobileMenuOpen && (
          <div className="border-b border-gray-200 bg-white p-4 shadow-sm md:hidden">
            <p className="mb-3 px-4 text-xs font-semibold tracking-wide text-gray-400">
              MENU NAVIGASI
            </p>

            <nav className="space-y-1.5">
              {menus.map((menu, index) => {
                const Icon = menu.icon;

                return (
                  <Link
                    key={menu.label}
                    href={menu.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                      index === 0
                        ? "bg-blue-50 font-semibold text-[#0756A5]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#0756A5]"
                    }`}
                  >
                    <Icon size={19} className="shrink-0" />
                    <span>{menu.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} />
                Keluar
              </button>
            </nav>
          </div>
        )}

        {/* Isi Dashboard */}
        <div className="space-y-6 p-4 sm:p-6 md:space-y-8 md:p-8">
          {/* Welcome */}
          <div className="rounded-2xl bg-[#0756A5] p-5 text-white sm:p-7 md:p-9">
            <p className="text-xs font-semibold tracking-wide text-blue-100 sm:text-sm">
              STUDENT DASHBOARD
            </p>

            <h2 className="mt-3 break-words text-2xl font-bold sm:text-3xl">
              Selamat datang, {user.name}!
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
              Mulai bangun portofolio digital dengan mengelola informasi diri,
              keterampilan, proyek, dan pencapaianmu.
            </p>
          </div>

          {/* Ringkasan */}
          <section>
            <h2 className="text-lg font-bold text-[#25364A]">
              Ringkasan Portofolio
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {summary.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <Icon
                        size={20}
                        className="shrink-0 text-[#0756A5]"
                      />
                    </div>

                    <p className="mt-4 break-words text-xl font-bold text-[#25364A]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Kelola Portofolio */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-[#25364A]">
              Kelola Portofolio
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Lengkapi informasi diri dan dokumentasikan hasil pekerjaanmu
              agar portofolio digital semakin lengkap.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:flex lg:flex-wrap">
              <Link
                href="/profile"
                className="flex min-h-11 items-center justify-center rounded-lg bg-[#0756A5] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Lengkapi Profil
              </Link>

              <Link
                href="/projects"
                className="flex min-h-11 items-center justify-center rounded-lg border border-[#0756A5] px-5 py-3 text-center text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Proyek
              </Link>

              <Link
                href="/certificates"
                className="flex min-h-11 items-center justify-center rounded-lg border border-[#0756A5] px-5 py-3 text-center text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Sertifikat
              </Link>

              <Link
                href="/achievements"
                className="flex min-h-11 items-center justify-center rounded-lg border border-[#0756A5] px-5 py-3 text-center text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Pencapaian
              </Link>
            </div>
          </section>

          {/* Preview Portofolio */}
          <section className="rounded-xl border border-blue-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <Eye size={20} className="shrink-0 text-[#0756A5]" />
                  Preview Portofolio
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Lihat tampilan profil digital yang berisi data pendidikan,
                  proyek, sertifikat, dan pencapaianmu.
                </p>
              </div>

              <Link
                href="/portfolio"
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 sm:w-auto"
              >
                Lihat Portofolio
                <Eye size={17} className="ml-2" />
              </Link>
            </div>
          </section>

          {/* Direktori Siswa */}
          <section className="rounded-xl border border-green-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <Users size={20} className="shrink-0 text-green-700" />
                  Direktori Siswa
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Jelajahi profil dan karya siswa lain yang telah
                  mempublikasikan portofolio mereka.
                </p>
              </div>

              <Link
                href="/directory"
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 sm:w-auto"
              >
                Jelajahi Direktori
                <Users size={17} className="ml-2" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
