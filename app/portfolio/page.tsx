
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  FolderKanban,
  Award,
  Trophy,
  CalendarDays,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  LockKeyhole,
  Palette,
  Check,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";
import {
  getPublicationSettings,
  savePublicationSettings,
} from "@/lib/publication";

type PortfolioTheme =
  | "formal"
  | "modern"
  | "minimal"
  | "executive"
  | "creative"
  | "technical"
  | "two-column"
  | "monochrome";

const portfolioThemes: {
  id: PortfolioTheme;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    id: "formal",
    name: "Formal",
    description: "Profesional dan klasik",
    color: "#0756A5",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bersih dan kontemporer",
    color: "#0F766E",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Sederhana dan lapang",
    color: "#64748B",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Elegan dan tegas",
    color: "#1E293B",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Dinamis dan ekspresif",
    color: "#0D9488",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Nuansa teknologi",
    color: "#0369A1",
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Tampilan dua kolom",
    color: "#2563EB",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Hitam dan putih",
    color: "#18181B",
  },
];

const themeStyles: Record<
  PortfolioTheme,
  {
    page: string;
    sheet: string;
    hero: string;
    heroText: string;
    secondaryText: string;
    accent: string;
    badge: string;
    sectionTitle: string;
    card: string;
    soft: string;
    divider: string;
  }
> = {
  formal: {
    page: "bg-[#F4F7FB]",
    sheet: "rounded-2xl border border-gray-200 bg-white shadow-sm",
    hero: "bg-[#0756A5]",
    heroText: "text-white",
    secondaryText: "text-blue-100",
    accent: "text-[#0756A5]",
    badge: "bg-blue-50 text-[#0756A5]",
    sectionTitle: "text-[#25364A]",
    card: "rounded-xl border border-gray-200 bg-white",
    soft: "bg-[#F4F7FB]",
    divider: "border-gray-200",
  },
  modern: {
    page: "bg-[#ECFDF5]",
    sheet: "rounded-3xl border border-emerald-100 bg-white shadow-md",
    hero: "bg-gradient-to-r from-[#0F766E] to-[#115E59]",
    heroText: "text-white",
    secondaryText: "text-emerald-100",
    accent: "text-[#0F766E]",
    badge: "bg-emerald-50 text-emerald-800",
    sectionTitle: "text-[#134E4A]",
    card: "rounded-2xl border border-emerald-100 bg-white",
    soft: "bg-emerald-50",
    divider: "border-emerald-100",
  },
  minimal: {
    page: "bg-[#F8FAFC]",
    sheet: "rounded-lg border border-slate-200 bg-white shadow-none",
    hero: "bg-[#E2E8F0]",
    heroText: "text-slate-900",
    secondaryText: "text-slate-600",
    accent: "text-slate-700",
    badge: "bg-slate-100 text-slate-700",
    sectionTitle: "text-slate-900",
    card: "rounded-lg border border-slate-200 bg-white",
    soft: "bg-slate-50",
    divider: "border-slate-200",
  },
  executive: {
    page: "bg-[#E2E8F0]",
    sheet: "rounded-xl border border-slate-300 bg-white shadow-lg",
    hero: "bg-[#1E293B]",
    heroText: "text-white",
    secondaryText: "text-slate-300",
    accent: "text-[#334155]",
    badge: "bg-slate-100 text-slate-800",
    sectionTitle: "text-[#1E293B]",
    card: "rounded-lg border border-slate-200 bg-white",
    soft: "bg-slate-100",
    divider: "border-slate-300",
  },
  creative: {
    page: "bg-[#F0FDFA]",
    sheet: "rounded-3xl border border-teal-100 bg-white shadow-md",
    hero: "bg-gradient-to-br from-[#0D9488] to-[#0369A1]",
    heroText: "text-white",
    secondaryText: "text-teal-100",
    accent: "text-[#0F766E]",
    badge: "bg-teal-50 text-teal-800",
    sectionTitle: "text-[#134E4A]",
    card: "rounded-2xl border border-teal-100 bg-white",
    soft: "bg-teal-50",
    divider: "border-teal-100",
  },
  technical: {
    page: "bg-[#EFF6FF]",
    sheet: "rounded-xl border border-blue-200 bg-white shadow-sm",
    hero: "bg-[#0C4A6E]",
    heroText: "text-white",
    secondaryText: "text-sky-200",
    accent: "text-[#0369A1]",
    badge: "bg-sky-50 text-sky-800",
    sectionTitle: "text-[#0C4A6E]",
    card: "rounded-lg border border-blue-200 bg-white",
    soft: "bg-sky-50",
    divider: "border-blue-200",
  },
  "two-column": {
    page: "bg-[#F1F5F9]",
    sheet: "rounded-2xl border border-slate-200 bg-white shadow-sm",
    hero: "bg-[#1D4ED8]",
    heroText: "text-white",
    secondaryText: "text-blue-100",
    accent: "text-[#1D4ED8]",
    badge: "bg-blue-50 text-blue-800",
    sectionTitle: "text-[#1E3A8A]",
    card: "rounded-xl border border-slate-200 bg-white",
    soft: "bg-blue-50",
    divider: "border-slate-200",
  },
  monochrome: {
    page: "bg-[#E5E5E5]",
    sheet: "rounded-none border border-neutral-300 bg-white shadow-none",
    hero: "bg-[#18181B]",
    heroText: "text-white",
    secondaryText: "text-neutral-300",
    accent: "text-neutral-800",
    badge: "bg-neutral-100 text-neutral-800",
    sectionTitle: "text-neutral-900",
    card: "rounded-none border border-neutral-300 bg-white",
    soft: "bg-neutral-100",
    divider: "border-neutral-300",
  },
};

function isPortfolioTheme(value: string | null): value is PortfolioTheme {
  return portfolioThemes.some((theme) => theme.id === value);
}

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

function subscribeToPublication(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("skilltrack-publication", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skilltrack-publication", callback);
  };
}

function getPublicationSnapshot(userId: string | null | undefined) {
  if (!userId) return false;
  return getPublicationSettings(userId).isPublic;
}

function getSafeExternalUrl(value: string) {
  if (!value || !value.trim()) return null;

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PortfolioPage() {
  const router = useRouter();

  const userId = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const isPublic = useSyncExternalStore(
    subscribeToPublication,
    () => getPublicationSnapshot(userId),
    () => false
  );

  const [selectedTheme, setSelectedTheme] =
    useState<PortfolioTheme>("formal");

  const [themeLoaded, setThemeLoaded] = useState(false);

  const user = userId ? getCurrentUser() : null;
  const profile = userId ? getStudentProfile(userId) : null;
  const projects = userId ? getStudentProjects(userId) : [];
  const certificates = userId ? getStudentCertificates(userId) : [];
  const achievements = userId ? getStudentAchievements(userId) : [];

  useEffect(() => {
    if (userId === null || (userId && !user)) {
      router.replace("/login");
    }
  }, [userId, user, router]);

  useEffect(() => {
    if (!userId) return;

    const savedTheme = localStorage.getItem(
      `skilltrack_portfolio_theme_${userId}`
    );

    if (isPortfolioTheme(savedTheme)) {
      setSelectedTheme(savedTheme);
    } else {
      setSelectedTheme("formal");
    }

    setThemeLoaded(true);
  }, [userId]);

  function handleThemeChange(theme: PortfolioTheme) {
    if (!userId) return;

    setSelectedTheme(theme);

    localStorage.setItem(
      `skilltrack_portfolio_theme_${userId}`,
      theme
    );
  }

  function handlePublicationToggle() {
    if (!userId) return;

    savePublicationSettings(userId, !isPublic);
    window.dispatchEvent(new Event("skilltrack-publication"));
  }

  if (userId === undefined || userId === null || !user || !themeLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">
          Memuat portofolio...
        </p>
      </main>
    );
  }

  const fullName = profile?.fullName || user.name;
  const initial = fullName.charAt(0).toUpperCase();
  const style = themeStyles[selectedTheme];

  return (
    <>
      <PageHeader />

      <main className={`min-h-screen px-4 py-8 md:px-8 ${style.page}`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex justify-end">
            <span className={`rounded-full px-4 py-2 text-xs font-semibold ${style.badge}`}>
              PREVIEW PORTOFOLIO
            </span>
          </div>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Palette size={20} className="text-[#0756A5]" />
              <h2 className="font-bold text-[#25364A]">
                Pilih Tema Portofolio
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolioThemes.map((theme) => {
                const active = selectedTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    aria-pressed={active}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-[#0756A5] bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="h-7 w-7 rounded-lg border border-black/10"
                        style={{ backgroundColor: theme.color }}
                      />
                      {active && (
                        <Check size={18} className="text-[#0756A5]" />
                      )}
                    </div>

                    <p className="text-sm font-semibold text-[#25364A]">
                      {theme.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Tema yang dipilih akan tersimpan otomatis pada akun ini.
            </p>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe size={21} className="text-green-600" />
                  ) : (
                    <LockKeyhole size={21} className="text-gray-500" />
                  )}

                  <h2 className="font-bold text-[#25364A]">
                    Publikasi Portofolio
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {isPublic
                    ? "Portofolio kamu berstatus Publik dan dapat ditemukan melalui Direktori Siswa."
                    : "Portofolio kamu berstatus Privat dan tidak ditampilkan di Direktori Siswa."}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    isPublic
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isPublic ? "PUBLIK" : "PRIVAT"}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePublicationToggle}
                className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                  isPublic
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-[#0756A5] hover:bg-blue-800"
                }`}
              >
                {isPublic ? "Jadikan Privat" : "Publikasikan Portofolio"}
              </button>
            </div>

            <p className="mt-4 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500">
              Pengaturan publikasi menggunakan LocalStorage. Informasi
              kontak pribadi hanya ditampilkan pada preview pemilik akun,
              bukan pada halaman publik Direktori Siswa.
            </p>
          </section>

          <section className={`overflow-hidden ${style.sheet}`}>
            <div className={`px-6 py-10 md:px-10 ${style.hero}`}>
              <p className={`text-sm font-medium tracking-wider ${style.secondaryText}`}>
                STUDENT DIGITAL PORTFOLIO
              </p>

              <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={`Foto ${fullName}`}
                    className="h-28 w-28 rounded-full border-4 border-white/80 object-cover"
                  />
                ) : (
                  <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-white text-4xl font-bold ${style.accent}`}>
                    {initial}
                  </div>
                )}

                <div>
                  <h1 className={`text-3xl font-bold md:text-4xl ${style.heroText}`}>
                    {fullName}
                  </h1>

                  <p className={`mt-2 ${style.secondaryText}`}>
                    {profile?.major || "Jurusan belum diisi"}
                  </p>

                  <p className={`mt-1 text-sm ${style.secondaryText}`}>
                    {profile?.school || "Nama sekolah belum diisi"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_2fr] md:p-10">
              <aside className="space-y-7">
                <section>
                  <h2 className={`flex items-center gap-2 font-bold ${style.sectionTitle}`}>
                    <User size={19} className={style.accent} />
                    Tentang Saya
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                    {profile?.bio || "Belum ada deskripsi diri."}
                  </p>
                </section>

                <section>
                  <h2 className={`font-bold ${style.sectionTitle}`}>
                    Informasi Kontak
                  </h2>

                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p className="flex items-start gap-2 break-all">
                      <Mail size={17} className={`mt-0.5 shrink-0 ${style.accent}`} />
                      {profile?.email || user.email}
                    </p>

                    {profile?.phone && (
                      <p className="flex items-start gap-2">
                        <Phone size={17} className={`mt-0.5 shrink-0 ${style.accent}`} />
                        {profile.phone}
                      </p>
                    )}

                    {profile?.address && (
                      <p className="flex items-start gap-2">
                        <MapPin size={17} className={`mt-0.5 shrink-0 ${style.accent}`} />
                        {profile.address}
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className={`flex items-center gap-2 font-bold ${style.sectionTitle}`}>
                    <GraduationCap size={19} className={style.accent} />
                    Pendidikan
                  </h2>

                  <div className={`mt-3 p-4 ${style.soft} ${style.card}`}>
                    <p className={`font-semibold ${style.sectionTitle}`}>
                      {profile?.school || "Sekolah belum diisi"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {profile?.major || "Jurusan belum diisi"}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {profile?.startYear || "-"} – {profile?.graduationYear || "-"}
                    </p>
                  </div>
                </section>
              </aside>

              <div className="space-y-8">
                <section>
                  <h2 className={`flex items-center gap-2 text-lg font-bold ${style.sectionTitle}`}>
                    <FolderKanban size={20} className={style.accent} />
                    Proyek Saya
                    <span className={`ml-auto rounded-full px-3 py-1 text-xs ${style.badge}`}>
                      {projects.length} proyek
                    </span>
                  </h2>

                  <div className="mt-4 space-y-3">
                    {projects.length === 0 ? (
                      <p className={`p-4 text-sm text-gray-500 ${style.soft} ${style.card}`}>
                        Belum ada proyek yang ditambahkan.
                      </p>
                    ) : (
                      projects.map((project) => {
                        const safeUrl = getSafeExternalUrl(project.link);

                        return (
                          <article key={project.id} className={`p-4 ${style.card}`}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h3 className={`font-semibold ${style.sectionTitle}`}>
                                {project.title}
                              </h3>

                              <span className={`rounded-full px-3 py-1 text-xs ${style.badge}`}>
                                {project.category}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                              {project.description}
                            </p>

                            {project.technologies && (
                              <p className="mt-3 text-xs text-gray-500">
                                Teknologi: {project.technologies}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-gray-500">
                              Tahun: {project.year || "-"}
                            </p>

                            {project.link && (
                              safeUrl ? (
                                <a
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline ${style.accent}`}
                                >
                                  Lihat proyek
                                  <ExternalLink size={14} />
                                </a>
                              ) : (
                                <p className="mt-3 text-xs text-red-600">
                                  Link proyek tidak valid.
                                </p>
                              )
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>

                <section>
                  <h2 className={`flex items-center gap-2 text-lg font-bold ${style.sectionTitle}`}>
                    <Award size={20} className={style.accent} />
                    Sertifikat
                    <span className={`ml-auto rounded-full px-3 py-1 text-xs ${style.badge}`}>
                      {certificates.length} sertifikat
                    </span>
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {certificates.length === 0 ? (
                      <p className={`p-4 text-sm text-gray-500 sm:col-span-2 ${style.soft} ${style.card}`}>
                        Belum ada sertifikat yang ditambahkan.
                      </p>
                    ) : (
                      certificates.map((certificate) => {
                        const safeUrl = getSafeExternalUrl(
                          certificate.credentialUrl
                        );

                        return (
                          <article
                            key={certificate.id}
                            className={`overflow-hidden ${style.card}`}
                          >
                            {certificate.imageDataUrl && (
                              <img
                                src={certificate.imageDataUrl}
                                alt={`Sertifikat ${certificate.title}`}
                                className="h-36 w-full object-cover"
                              />
                            )}

                            <div className="p-4">
                              <h3 className={`font-semibold ${style.sectionTitle}`}>
                                {certificate.title}
                              </h3>

                              <p className="mt-1 text-sm text-gray-600">
                                {certificate.issuer}
                              </p>

                              <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <CalendarDays size={14} />
                                {formatDate(certificate.issueDate)}
                              </p>

                              {certificate.credentialUrl && (
                                safeUrl ? (
                                  <a
                                    href={safeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline ${style.accent}`}
                                  >
                                    Lihat bukti
                                    <ExternalLink size={14} />
                                  </a>
                                ) : (
                                  <p className="mt-3 text-xs text-red-600">
                                    Link sertifikat tidak valid.
                                  </p>
                                )
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>

                <section>
                  <h2 className={`flex items-center gap-2 text-lg font-bold ${style.sectionTitle}`}>
                    <Trophy size={20} className={style.accent} />
                    Pencapaian
                    <span className={`ml-auto rounded-full px-3 py-1 text-xs ${style.badge}`}>
                      {achievements.length} pencapaian
                    </span>
                  </h2>

                  <div className="mt-4 space-y-3">
                    {achievements.length === 0 ? (
                      <p className={`p-4 text-sm text-gray-500 ${style.soft} ${style.card}`}>
                        Belum ada pencapaian yang ditambahkan.
                      </p>
                    ) : (
                      achievements.map((achievement) => (
                        <article
                          key={achievement.id}
                          className={`overflow-hidden sm:flex ${style.card}`}
                        >
                          {achievement.imageDataUrl && (
                            <img
                              src={achievement.imageDataUrl}
                              alt={`Bukti ${achievement.title}`}
                              className="h-40 w-full object-cover sm:h-auto sm:w-36"
                            />
                          )}

                          <div className="flex-1 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h3 className={`font-semibold ${style.sectionTitle}`}>
                                {achievement.title}
                              </h3>

                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                                {achievement.category}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-600">
                              {achievement.organizer}
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <CalendarDays size={14} />
                              {formatDate(achievement.date)}
                            </p>

                            {achievement.description && (
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                                {achievement.description}
                              </p>
                            )}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </section>

          <p className="mt-5 text-center text-xs text-gray-400">
            Portofolio ini menampilkan data yang tersimpan pada akun SkillTrack.
          </p>
        </div>
      </main>
    </>
  );
}
