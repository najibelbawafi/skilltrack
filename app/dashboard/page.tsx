
"use client";

import { useEffect, useSyncExternalStore } from "react";
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
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-6 md:flex">
        <Link href="/" className="text-2xl font-bold text-[#0756A5]">
          SkillTrack
        </Link>

        <p className="mb-8 mt-2 text-xs text-gray-400">
          STUDENT PORTFOLIO PLATFORM
        </p>

        <nav className="space-y-2">
          {menus.map((menu, index) => {
            const Icon = menu.icon;

            const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
              index === 0
                ? "bg-blue-50 font-semibold text-[#0756A5]"
                : "text-gray-600"
            }`;

            if (menu.href) {
              return (
                <Link
                  key={menu.label}
                  href={menu.href}
                  className={`${className} ${
                    index !== 0 ? "hover:bg-gray-50" : ""
                  }`}
                >
                  <Icon size={19} />
                  {menu.label}
                </Link>
              );
            }

            return (
              <div
                key={menu.label}
                className={`${className} cursor-not-allowed opacity-60`}
              >
                <Icon size={19} />
                {menu.label}
              </div>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={19} />
          Keluar
        </button>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <Menu className="text-gray-500 md:hidden" size={22} />
            <h1 className="text-lg font-bold text-[#25364A]">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#25364A]">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0756A5]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8">
          <div className="rounded-2xl bg-[#0756A5] p-7 text-white md:p-9">
            <p className="text-sm text-blue-100">STUDENT DASHBOARD</p>

            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Selamat datang, {user.name}!
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
              Mulai bangun portofolio digital dengan mengelola
              informasi diri, keterampilan, proyek, dan pencapaianmu.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#25364A]">
              Ringkasan Portofolio
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summary.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <Icon size={20} className="text-[#0756A5]" />
                    </div>

                    <p className="mt-4 text-xl font-bold text-[#25364A]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-bold text-[#25364A]">
              Kelola Portofolio
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Lengkapi informasi diri dan dokumentasikan hasil
              pekerjaanmu agar portofolio digital semakin lengkap.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-lg bg-[#0756A5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Lengkapi Profil
              </Link>

              <Link
                href="/projects"
                className="rounded-lg border border-[#0756A5] px-5 py-2.5 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Proyek
              </Link>

              <Link
                href="/certificates"
                className="rounded-lg border border-[#0756A5] px-5 py-2.5 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Sertifikat
              </Link>

              <Link
                href="/achievements"
                className="rounded-lg border border-[#0756A5] px-5 py-2.5 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
              >
                Kelola Pencapaian
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <Eye size={20} className="text-[#0756A5]" />
                  Preview Portofolio
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Lihat tampilan profil digital yang berisi data
                  pendidikan, proyek, sertifikat, dan pencapaianmu.
                </p>
              </div>

              <Link
                href="/portfolio"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Lihat Portofolio
                <Eye size={17} className="ml-2" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-green-200 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <Users size={20} className="text-green-700" />
                  Direktori Siswa
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Jelajahi profil dan karya siswa lain yang telah
                  mempublikasikan portofolio mereka.
                </p>
              </div>

              <Link
                href="/directory"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Jelajahi Direktori
                <Users size={17} className="ml-2" />
              </Link>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 md:hidden"
          >
            Keluar
          </button>
        </div>
      </section>
    </main>
  );
}
