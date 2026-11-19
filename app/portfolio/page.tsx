
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";

type PortfolioTheme =
  | "formal"
  | "modern"
  | "minimal"
  | "executive"
  | "creative"
  | "technical"
  | "two-column"
  | "monochrome";

type PortfolioProfile = {
  fullName: string;
  email: string;
  phone: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  bio: string;
  major: string;
  school: string;
  startYear: string;
  graduationYear: string;
  photoUrl: string;
};

type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
};

type PortfolioCertificate = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  credentialUrl: string;
  imageDataUrl: string;
};

type PortfolioAchievement = {
  id: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  description: string;
  imageDataUrl: string;
};

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

function isPortfolioTheme(
  value: string | null
): value is PortfolioTheme {
  return portfolioThemes.some((theme) => theme.id === value);
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

const sectionAnimation = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

export default function PortfolioPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const userId = user?.id ?? null;

  const [selectedTheme, setSelectedTheme] =
    useState<PortfolioTheme>("formal");

  const [themeLoaded, setThemeLoaded] = useState(false);
  const [profile, setProfile] =
    useState<PortfolioProfile | null>(null);

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [certificates, setCertificates] =
    useState<PortfolioCertificate[]>([]);
  const [achievements, setAchievements] =
    useState<PortfolioAchievement[]>([]);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState("");

  const [isPublic, setIsPublic] = useState(false);
  const [publicationLoaded, setPublicationLoaded] = useState(false);
  const [publicationSaving, setPublicationSaving] = useState(false);
  const [publicationError, setPublicationError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!userId) return;

    try {
      const savedTheme = localStorage.getItem(
        `skilltrack_portfolio_theme_${userId}`
      );

      if (isPortfolioTheme(savedTheme)) {
        setSelectedTheme(savedTheme);
      } else {
        setSelectedTheme("formal");
      }
    } catch {
      setSelectedTheme("formal");
    }

    setThemeLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (!userId || !user) return;

    let mounted = true;
    const currentUser = user;

    async function loadPortfolioData() {
      setDataLoaded(false);
      setDataError("");

      try {
        const [
          profileResult,
          projectsResult,
          certificatesResult,
          achievementsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle(),

          supabase
            .from("projects")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),

          supabase
            .from("certificates")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),

          supabase
            .from("achievements")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (projectsResult.error) throw projectsResult.error;
        if (certificatesResult.error) throw certificatesResult.error;
        if (achievementsResult.error) throw achievementsResult.error;

        if (!mounted) return;

        const profileData = profileResult.data;

        setProfile(
          profileData
            ? {
                fullName: profileData.full_name ?? currentUser.name,
                email: currentUser.email,
                phone: profileData.phone ?? "",
                birthPlace: profileData.birth_place ?? "",
                birthDate: profileData.birth_date ?? "",
                gender: profileData.gender ?? "",
                address: profileData.address ?? "",
                bio: profileData.bio ?? "",
                major: profileData.major ?? "",
                school: profileData.school ?? "",
                startYear: profileData.start_year ?? "",
                graduationYear: profileData.graduation_year ?? "",
                photoUrl: profileData.photo_url ?? "",
              }
            : null
        );

        setProjects(
          (projectsResult.data ?? []).map((row) => ({
            id: row.id,
            title: row.title ?? "",
            category: row.category ?? "",
            description: row.description ?? "",
            technologies: row.technologies ?? "",
            year: row.year ?? "",
            link: row.link ?? "",
          }))
        );

        setCertificates(
          (certificatesResult.data ?? []).map((row) => ({
            id: row.id,
            title: row.title ?? "",
            issuer: row.issuer ?? "",
            issueDate: row.issue_date ?? "",
            description: row.description ?? "",
            credentialUrl: row.credential_url ?? "",
            imageDataUrl: row.image_url ?? "",
          }))
        );

        setAchievements(
          (achievementsResult.data ?? []).map((row) => ({
            id: row.id,
            title: row.title ?? "",
            category: row.category ?? "",
            organizer: row.organizer ?? "",
            date: row.date ?? "",
            description: row.description ?? "",
            imageDataUrl: row.image_url ?? "",
          }))
        );
      } catch (error) {
        console.error("Gagal mengambil data portofolio:", error);

        if (mounted) {
          setDataError(
            "Data portofolio gagal dimuat. Silakan muat ulang halaman."
          );
        }
      } finally {
        if (mounted) setDataLoaded(true);
      }
    }

    loadPortfolioData();

    return () => {
      mounted = false;
    };
  }, [userId, user]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    async function loadPublicationSettings() {
      try {
        const { data, error } = await supabase
          .from("publication_settings")
          .select("is_public")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          setIsPublic(data?.is_public ?? false);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil pengaturan publikasi:",
          error
        );

        if (mounted) {
          setPublicationError("Pengaturan publikasi gagal dimuat.");
        }
      } finally {
        if (mounted) setPublicationLoaded(true);
      }
    }

    loadPublicationSettings();

    return () => {
      mounted = false;
    };
  }, [userId]);

  function handleThemeChange(theme: PortfolioTheme) {
    if (!userId) return;

    setSelectedTheme(theme);

    try {
      localStorage.setItem(
        `skilltrack_portfolio_theme_${userId}`,
        theme
      );
    } catch (error) {
      console.error("Gagal menyimpan tema:", error);
    }
  }

  async function handlePublicationToggle() {
    if (!userId || publicationSaving) return;

    const nextValue = !isPublic;

    setPublicationSaving(true);
    setPublicationError("");

    try {
      const { error } = await supabase
        .from("publication_settings")
        .upsert(
          {
            user_id: userId,
            is_public: nextValue,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setIsPublic(nextValue);
    } catch (error) {
      console.error(
        "Gagal menyimpan pengaturan publikasi:",
        error
      );

      setPublicationError(
        "Gagal menyimpan perubahan. Silakan coba kembali."
      );
    } finally {
      setPublicationSaving(false);
    }
  }

  if (
    loading ||
    !user ||
    !themeLoaded ||
    !dataLoaded ||
    !publicationLoaded
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#0756A5]" />
          Memuat portofolio...
        </div>
      </main>
    );
  }

  if (dataError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-4">
        <div className="glass-card max-w-md p-6 text-center">
          <p className="font-semibold text-red-700">
            Gagal memuat portofolio
          </p>
          <p className="mt-2 text-sm text-gray-600">{dataError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="glass-button mt-5 rounded-xl bg-[#0756A5] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Muat Ulang
          </button>
        </div>
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
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-6 flex justify-end">
            <span className={`rounded-full px-4 py-2 text-xs font-semibold ${style.badge}`}>
              PREVIEW PORTOFOLIO
            </span>
          </div>

          <motion.section
            {...sectionAnimation}
            className="glass-card mb-6 p-5 md:p-6"
          >
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
                  <motion.button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    aria-pressed={active}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                      active
                        ? "border-[#0756A5] bg-blue-50/90 ring-2 ring-blue-100"
                        : "border-white/80 bg-white/65 hover:border-blue-300 hover:bg-white"
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
                  </motion.button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Tema yang dipilih akan tersimpan otomatis pada akun ini.
            </p>
          </motion.section>

          <motion.section
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: 0.08 }}
            className="glass-card mb-6 p-5 md:p-6"
          >
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

              <motion.button
                type="button"
                onClick={handlePublicationToggle}
                disabled={publicationSaving}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-button rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isPublic
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-[#0756A5] hover:bg-blue-800"
                }`}
              >
                {publicationSaving
                  ? "Menyimpan..."
                  : isPublic
                    ? "Jadikan Privat"
                    : "Publikasikan Portofolio"}
              </motion.button>
            </div>

            {publicationError && (
              <p className="mt-3 text-sm text-red-600">
                {publicationError}
              </p>
            )}

            <p className="mt-4 border-t border-gray-100/80 pt-4 text-xs leading-5 text-gray-500">
              Status publikasi tersimpan di Supabase. Informasi kontak
              pribadi hanya ditampilkan pada preview pemilik akun,
              bukan pada halaman publik Direktori Siswa.
            </p>
          </motion.section>

          {/* Dokumen portofolio tetap menggunakan latar putih solid */}
          <motion.section
            {...sectionAnimation}
            transition={{ ...sectionAnimation.transition, delay: 0.12 }}
            className={`overflow-hidden ${style.sheet}`}
          >
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
                  <div
                    className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-white text-4xl font-bold ${style.accent}`}
                  >
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

                            {project.link &&
                              (safeUrl ? (
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
                              ))}
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
                        const safeUrl = getSafeExternalUrl(certificate.credentialUrl);

                        return (
                          <article key={certificate.id} className={`overflow-hidden ${style.card}`}>
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

                              {certificate.credentialUrl &&
                                (safeUrl ? (
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
                                ))}
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
          </motion.section>

          <p className="mt-5 text-center text-xs text-gray-400">
            Portofolio ini menampilkan data yang tersimpan pada akun SkillTrack.
          </p>
        </motion.div>
      </main>
    </>
  );
}
