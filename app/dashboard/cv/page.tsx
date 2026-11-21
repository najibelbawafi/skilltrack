"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  User,
  GraduationCap,
  FolderKanban,
  Award,
  Trophy,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  LoaderCircle,
  FileText,
  Check,
  Globe,
  Settings2,
  Eye,
  LockKeyhole,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";
import type { StudentProfile } from "@/lib/profile";
import type { StudentSkill } from "@/lib/skills";
import { downloadElementAsPDF } from "@/lib/pdf";

type CVTheme =
  | "formal"
  | "modern"
  | "minimal"
  | "executive"
  | "creative"
  | "technical"
  | "two-column"
  | "monochrome";

type ThemeConfig = {
  id: CVTheme;
  name: string;
  description: string;
  accent: string;
  soft: string;
  text: string;
  muted: string;
  border: string;
  header: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  birth_place: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  bio: string | null;
  major: string | null;
  school: string | null;
  start_year: string | null;
  graduation_year: string | null;
  photo_url: string | null;
  updated_at: string | null;
};

type ProjectRow = {
  id: string;
  user_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  technologies: string | null;
  year: string | null;
  link: string | null;
  created_at: string;
};

type CertificateRow = {
  id: string;
  user_id: string;
  title: string | null;
  issuer: string | null;
  issue_date: string | null;
  description: string | null;
  credential_url: string | null;
  image_url: string | null;
  created_at: string;
};

type AchievementRow = {
  id: string;
  user_id: string;
  title: string | null;
  category: string | null;
  organizer: string | null;
  date: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

type SkillRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

type CVPublicationRow = {
  user_id: string;
  is_public: boolean;
  updated_at: string;
};

type StudentProject = {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
  createdAt: string;
};

type StudentCertificate = {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  credentialUrl: string;
  imageDataUrl?: string;
  createdAt: string;
};

type StudentAchievement = {
  id: string;
  userId: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  description: string;
  imageDataUrl: string;
  createdAt: string;
};

const CV_THEMES: ThemeConfig[] = [
  {
    id: "formal",
    name: "Formal Blue",
    description: "Profesional dan formal",
    accent: "#0756A5",
    soft: "#EAF3FC",
    text: "#25364A",
    muted: "#64748B",
    border: "#0756A5",
    header: "#FFFFFF",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Modern dan dinamis",
    accent: "#087E8B",
    soft: "#E6F5F5",
    text: "#263445",
    muted: "#64748B",
    border: "#087E8B",
    header: "#FFFFFF",
  },
  {
    id: "minimal",
    name: "Minimalis",
    description: "Sederhana dan bersih",
    accent: "#555555",
    soft: "#F1F1F1",
    text: "#333333",
    muted: "#777777",
    border: "#777777",
    header: "#FFFFFF",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Elegan dan tegas",
    accent: "#17365D",
    soft: "#E9EEF5",
    text: "#202A36",
    muted: "#68778A",
    border: "#17365D",
    header: "#FFFFFF",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Ekspresif dan berwarna",
    accent: "#C05A35",
    soft: "#FFF0E9",
    text: "#303044",
    muted: "#777080",
    border: "#C05A35",
    header: "#FFFFFF",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Untuk bidang teknologi",
    accent: "#087F5B",
    soft: "#E6F5EF",
    text: "#203047",
    muted: "#64748B",
    border: "#087F5B",
    header: "#FFFFFF",
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Tampilan dua kolom",
    accent: "#3867A6",
    soft: "#EDF2FA",
    text: "#27364B",
    muted: "#64748B",
    border: "#3867A6",
    header: "#FFFFFF",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Hitam putih elegan",
    accent: "#222222",
    soft: "#EEEEEE",
    text: "#222222",
    muted: "#666666",
    border: "#333333",
    header: "#FFFFFF",
  },
];

const panelClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-50";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#064783] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function isCVTheme(value: string | null): value is CVTheme {
  return CV_THEMES.some((theme) => theme.id === value);
}

function getSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function mapProfile(
  row: ProfileRow,
  email: string,
  fallbackName: string
): StudentProfile {
  return {
    userId: row.id,
    fullName: row.full_name ?? fallbackName,
    email,
    phone: row.phone ?? "",
    birthPlace: row.birth_place ?? "",
    birthDate: row.birth_date ?? "",
    gender: row.gender ?? "",
    address: row.address ?? "",
    bio: row.bio ?? "",
    major: row.major ?? "",
    school: row.school ?? "",
    startYear: row.start_year ?? "",
    graduationYear: row.graduation_year ?? "",
    photoUrl: row.photo_url ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

function mapProject(row: ProjectRow): StudentProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    technologies: row.technologies ?? "",
    year: row.year ?? "",
    link: row.link ?? "",
    createdAt: row.created_at,
  };
}

function mapCertificate(row: CertificateRow): StudentCertificate {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    issueDate: row.issue_date ?? "",
    description: row.description ?? "",
    credentialUrl: row.credential_url ?? "",
    imageDataUrl: row.image_url ?? "",
    createdAt: row.created_at,
  };
}

function mapAchievement(row: AchievementRow): StudentAchievement {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "",
    category: row.category ?? "",
    organizer: row.organizer ?? "",
    date: row.date ?? "",
    description: row.description ?? "",
    imageDataUrl: row.image_url ?? "",
    createdAt: row.created_at,
  };
}

function mapSkill(row: SkillRow): StudentSkill {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function SectionHeading({
  icon,
  children,
  theme,
}: {
  icon: ReactNode;
  children: ReactNode;
  theme: ThemeConfig;
}) {
  return (
    <h2
      className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-bold tracking-wide"
      style={{
        color: theme.text,
        borderColor: theme.border,
      }}
    >
      <span style={{ color: theme.accent }}>{icon}</span>
      {children}
    </h2>
  );
}

export default function CVPage() {
  const router = useRouter();
  const cvRef = useRef<HTMLDivElement>(null);

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);

  const [newSkill, setNewSkill] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [savingPublication, setSavingPublication] = useState(false);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<CVTheme>("formal");
  const [cvIsPublic, setCvIsPublic] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!userId || !user) return;

    let active = true;

    async function loadPageData() {
      setLoaded(false);
      setSkillsLoading(true);
      setError("");

      let savedTheme: string | null = null;

      try {
        savedTheme = localStorage.getItem(`skilltrack_cv_theme_${userId}`);
      } catch {
        savedTheme = null;
      }

      setSelectedTheme(isCVTheme(savedTheme) ? savedTheme : "formal");

      const [
        profileResult,
        projectsResult,
        certificatesResult,
        achievementsResult,
        skillsResult,
        publicationResult,
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

        supabase
          .from("skills")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),

        supabase
          .from("cv_publication_settings")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (!active) return;

      const loadErrors: string[] = [];

      if (profileResult.error) {
        console.error("Gagal memuat profil:", profileResult.error);
        loadErrors.push("profil");
      } else {
        const row = profileResult.data as ProfileRow | null;

        setProfile(
          row
            ? mapProfile(row, user?.email ?? "", user?.name ?? "Pengguna")
            : null
        );
      }

      if (projectsResult.error) {
        console.error("Gagal memuat proyek:", projectsResult.error);
        loadErrors.push("proyek");
        setProjects([]);
      } else {
        setProjects(
          ((projectsResult.data ?? []) as ProjectRow[]).map(mapProject)
        );
      }

      if (certificatesResult.error) {
        console.error("Gagal memuat sertifikat:", certificatesResult.error);
        loadErrors.push("sertifikat");
        setCertificates(
          ((certificatesResult.data ?? []) as CertificateRow[]).map(
            mapCertificate
          )
        );
      } else {
        setCertificates(
          ((certificatesResult.data ?? []) as CertificateRow[]).map(
            mapCertificate
          )
        );
      }

      if (achievementsResult.error) {
        console.error("Gagal memuat pencapaian:", achievementsResult.error);
        loadErrors.push("pencapaian");
        setAchievements([]);
      } else {
        setAchievements(
          ((achievementsResult.data ?? []) as AchievementRow[]).map(
            mapAchievement
          )
        );
      }

      if (skillsResult.error) {
        console.error("Gagal memuat keterampilan:", skillsResult.error);
        loadErrors.push("keterampilan");
        setSkills([]);
      } else {
        setSkills(((skillsResult.data ?? []) as SkillRow[]).map(mapSkill));
      }

      if (publicationResult.error) {
        console.error(
          "Gagal memuat pengaturan publikasi CV:",
          publicationResult.error
        );
        loadErrors.push("pengaturan publikasi CV");
        setCvIsPublic(false);
      } else {
        const publication =
          publicationResult.data as CVPublicationRow | null;

        setCvIsPublic(publication?.is_public ?? false);
      }

      if (loadErrors.length > 0) {
        setError(
          `Sebagian data gagal dimuat: ${loadErrors.join(", ")}. Periksa koneksi dan konfigurasi Supabase.`
        );
      }

      setSkillsLoading(false);
      setLoaded(true);
    }

    loadPageData().catch((err) => {
      console.error("Gagal memuat data CV:", err);

      if (active) {
        setError("Terjadi kesalahan saat memuat data CV.");
        setSkillsLoading(false);
        setLoaded(true);
      }
    });

    return () => {
      active = false;
    };
  }, [userId, user]);

  const theme =
    CV_THEMES.find((item) => item.id === selectedTheme) ?? CV_THEMES[0];

  function changeTheme(themeId: CVTheme) {
    if (!userId) return;

    setSelectedTheme(themeId);

    try {
      localStorage.setItem(`skilltrack_cv_theme_${userId}`, themeId);
    } catch (err) {
      console.error("Gagal menyimpan tema CV:", err);
    }
  }

  async function toggleCVPublication() {
    if (!userId || savingPublication) return;

    const nextStatus = !cvIsPublic;

    setSavingPublication(true);
    setError("");

    try {
      const { error: publicationError } = await supabase
        .from("cv_publication_settings")
        .upsert(
          {
            user_id: userId,
            is_public: nextStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (publicationError) throw publicationError;

      setCvIsPublic(nextStatus);
    } catch (err) {
      console.error("Gagal menyimpan pengaturan publikasi CV:", err);
      setError(
        "Gagal menyimpan pengaturan publikasi CV. Silakan coba kembali."
      );
    } finally {
      setSavingPublication(false);
    }
  }

  async function addSkill() {
    const name = newSkill.trim();

    if (!name || !userId || savingSkill) return;

    if (name.length > 60) {
      setError("Nama keterampilan maksimal 60 karakter.");
      return;
    }

    if (
      skills.some(
        (skill) => skill.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("Keterampilan tersebut sudah ditambahkan.");
      return;
    }

    setSavingSkill(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from("skills")
        .insert({ user_id: userId, name })
        .select("*")
        .single();

      if (insertError) throw insertError;

      setSkills((previous) => [...previous, mapSkill(data as SkillRow)]);
      setNewSkill("");
    } catch (err) {
      console.error("Gagal menambahkan keterampilan:", err);
      setError("Gagal menambahkan keterampilan. Silakan coba kembali.");
    } finally {
      setSavingSkill(false);
    }
  }

  async function removeSkill(id: string) {
    if (!userId || deletingSkillId) return;

    setDeletingSkillId(id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("skills")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      setSkills((previous) => previous.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("Gagal menghapus keterampilan:", err);
      setError("Gagal menghapus keterampilan. Silakan coba kembali.");
    } finally {
      setDeletingSkillId(null);
    }
  }

  async function handleDownload() {
    if (!cvRef.current || generatingPdf) return;

    setGeneratingPdf(true);
    setError("");

    try {
      const safeName = (profile?.fullName || user?.name || "CV")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      await downloadElementAsPDF(
        cvRef.current,
        `CV-${safeName || "Siswa"}.pdf`
      );
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      setError("PDF gagal dibuat. Silakan coba kembali.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (authLoading || !user || !loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <LoaderCircle size={19} className="animate-spin text-[#0756A5]" />
          <p className="text-sm text-slate-600">Memuat CV...</p>
        </div>
      </main>
    );
  }

  const fullName = profile?.fullName || user.name;
  const email = profile?.email || user.email;
  const twoColumn = selectedTheme === "two-column";

  const profileSection = (
    <section>
      <SectionHeading icon={<User size={17} />} theme={theme}>
        PROFIL SINGKAT
      </SectionHeading>
      <p
        className="whitespace-pre-line text-sm leading-7"
        style={{ color: theme.muted }}
      >
        {profile?.bio || "Belum ada deskripsi diri."}
      </p>
    </section>
  );

  const educationSection = (
    <section>
      <SectionHeading icon={<GraduationCap size={17} />} theme={theme}>
        PENDIDIKAN
      </SectionHeading>
      <div>
        <h3 className="font-semibold" style={{ color: theme.text }}>
          {profile?.school || "Sekolah belum diisi"}
        </h3>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          {profile?.major || "Jurusan belum diisi"}
        </p>
        <p className="mt-1 text-xs" style={{ color: theme.muted }}>
          {profile?.startYear || "-"} - {profile?.graduationYear || "-"}
        </p>
      </div>
    </section>
  );

  const skillsSection = (
    <section>
      <SectionHeading icon={<BriefcaseBusiness size={17} />} theme={theme}>
        KETERAMPILAN
      </SectionHeading>

      {skills.length === 0 ? (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada keterampilan yang ditambahkan.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-md px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: theme.soft,
                color: theme.accent,
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );

  const projectsSection = (
    <section>
      <SectionHeading icon={<FolderKanban size={17} />} theme={theme}>
        PROYEK
      </SectionHeading>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Belum ada proyek.
          </p>
        ) : (
          projects.map((project) => {
            const safeLink = getSafeExternalUrl(project.link);

            return (
              <article key={project.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold" style={{ color: theme.text }}>
                    {project.title}
                  </h3>
                  <span className="text-xs" style={{ color: theme.muted }}>
                    {project.year || "-"}
                  </span>
                </div>

                {project.category && (
                  <p
                    className="mt-1 text-xs font-medium"
                    style={{ color: theme.accent }}
                  >
                    {project.category}
                  </p>
                )}

                {project.description && (
                  <p
                    className="mt-2 whitespace-pre-line text-sm leading-6"
                    style={{ color: theme.muted }}
                  >
                    {project.description}
                  </p>
                )}

                {project.technologies && (
                  <p className="mt-2 text-xs" style={{ color: theme.muted }}>
                    Teknologi: {project.technologies}
                  </p>
                )}

                {safeLink && (
                  <a
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: theme.accent }}
                  >
                    Lihat proyek <ExternalLink size={12} />
                  </a>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );

  const certificatesSection = (
    <section>
      <SectionHeading icon={<Award size={17} />} theme={theme}>
        SERTIFIKAT
      </SectionHeading>

      <div className="space-y-4">
        {certificates.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Belum ada sertifikat.
          </p>
        ) : (
          certificates.map((certificate) => {
            const safeLink = getSafeExternalUrl(certificate.credentialUrl);

            return (
              <article key={certificate.id}>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {certificate.title}
                </h3>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  {certificate.issuer}
                </p>
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                  {formatDate(certificate.issueDate)}
                </p>
                {certificate.description && (
                  <p
                    className="mt-2 whitespace-pre-line text-sm leading-6"
                    style={{ color: theme.muted }}
                  >
                    {certificate.description}
                  </p>
                )}
                {safeLink && (
                  <a
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: theme.accent }}
                  >
                    Lihat kredensial <ExternalLink size={12} />
                  </a>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );

  const achievementsSection = (
    <section>
      <SectionHeading icon={<Trophy size={17} />} theme={theme}>
        PENCAPAIAN
      </SectionHeading>

      <div className="space-y-4">
        {achievements.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Belum ada pencapaian.
          </p>
        ) : (
          achievements.map((achievement) => (
            <article key={achievement.id}>
              <h3 className="font-semibold" style={{ color: theme.text }}>
                {achievement.title}
              </h3>
              {achievement.category && (
                <p className="mt-1 text-xs" style={{ color: theme.accent }}>
                  {achievement.category}
                </p>
              )}
              {achievement.organizer && (
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  {achievement.organizer}
                </p>
              )}
              <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                {formatDate(achievement.date)}
              </p>
              {achievement.description && (
                <p
                  className="mt-2 whitespace-pre-line text-sm leading-6"
                  style={{ color: theme.muted }}
                >
                  {achievement.description}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-[#0756A5]"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="min-w-0">
              <h1 className="font-bold text-slate-900">CV Saya</h1>
              <p className="text-xs text-slate-500">
                Kelola dan buat CV profesional
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
          >
            <User size={16} />
            Edit Profil
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit space-y-5">
          <section className={panelClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                  <Globe size={18} />
                </div>
                <h2 className="font-bold text-slate-900">Publikasi CV</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Atur visibilitas CV melalui Direktori Siswa.
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  cvIsPublic
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {cvIsPublic ? "Publik" : "Privat"}
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start gap-2.5">
                {cvIsPublic ? (
                  <Eye size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                ) : (
                  <LockKeyhole
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                )}
                <p className="text-xs leading-5 text-slate-600">
                  {cvIsPublic
                    ? "CV kamu dapat dibuka melalui Direktori Siswa."
                    : "CV kamu belum dapat dilihat oleh pengunjung Direktori Siswa."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCVPublication}
              disabled={savingPublication}
              className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                cvIsPublic
                  ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : primaryButtonClass
              }`}
            >
              {savingPublication ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Globe size={17} />
              )}
              {savingPublication
                ? "Menyimpan..."
                : cvIsPublic
                  ? "Jadikan Privat"
                  : "Publikasikan CV"}
            </button>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                <Settings2 size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Tema CV</h2>
                <p className="text-xs text-slate-500">Pilih tampilan dokumen</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CV_THEMES.map((item) => {
                const active = selectedTheme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTheme(item.id)}
                    aria-pressed={active}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      active
                        ? "border-[#0756A5] bg-blue-50 ring-1 ring-[#0756A5]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className="mb-2 flex h-12 items-center justify-center rounded-lg"
                      style={{ backgroundColor: item.soft }}
                    >
                      <div
                        className="h-7 w-10 rounded-sm border-t-4 bg-white p-1 shadow-sm"
                        style={{ borderColor: item.accent }}
                      >
                        <div
                          className="h-1 w-5 rounded"
                          style={{ backgroundColor: item.accent }}
                        />
                        <div className="mt-1 h-1 w-7 rounded bg-slate-200" />
                        <div className="mt-1 h-1 w-6 rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-800">
                        {item.name}
                      </span>
                      {active && (
                        <Check
                          size={14}
                          className="shrink-0 text-[#0756A5]"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Tema tersimpan otomatis dan digunakan saat mengunduh PDF.
            </p>
          </section>

          <section className={panelClass}>
            <div className="mb-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                <BriefcaseBusiness size={18} />
              </div>
              <h2 className="font-bold text-slate-900">Keterampilan</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Tambahkan kemampuan teknis dan nonteknis ke dalam CV.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                addSkill();
              }}
              className="space-y-2"
            >
              <input
                type="text"
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                placeholder="Contoh: Arduino, IoT, Python"
                maxLength={60}
                className={inputClass}
              />

              <button
                type="submit"
                disabled={savingSkill || skillsLoading || !newSkill.trim()}
                className={`${primaryButtonClass} w-full`}
              >
                {savingSkill ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {savingSkill ? "Menyimpan..." : "Tambah Keterampilan"}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-4 space-y-2">
              {skillsLoading ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  <LoaderCircle size={14} className="animate-spin" />
                  Memuat keterampilan...
                </div>
              ) : skills.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  Belum ada keterampilan. Tambahkan keterampilan untuk
                  melengkapi CV.
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="break-all text-sm text-slate-700">
                        {skill.name}
                      </span>

                      <button
                        type="button"
                        disabled={deletingSkillId === skill.id}
                        onClick={() => removeSkill(skill.id)}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Hapus ${skill.name}`}
                      >
                        {deletingSkillId === skill.id ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs leading-5 text-slate-500">
                Data profil, proyek, sertifikat, pencapaian, dan keterampilan
                diambil dari akun SkillTrack kamu.
              </p>
              <Link
                href="/profile"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0756A5] hover:text-blue-800"
              >
                Edit Profil Saya
                <ExternalLink size={14} />
              </Link>
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={19} className="text-[#0756A5]" />
                <h2 className="font-bold text-slate-900">Preview CV</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Pratinjau dokumen sebelum diunduh.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              {theme.name} · A4
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-200/60 p-2 sm:p-5">
            <div
              ref={cvRef}
              className="mx-auto min-h-[1123px] w-full min-w-[320px] max-w-[794px] overflow-hidden bg-white p-6 shadow-lg sm:p-10"
              style={{
                color: theme.text,
                backgroundColor: theme.header,
                fontFamily:
                  selectedTheme === "executive"
                    ? "Georgia, serif"
                    : "Arial, sans-serif",
              }}
            >
              <div
                className={`pb-6 ${
                  selectedTheme === "creative"
                    ? "border-l-8 pl-5"
                    : "border-b-4"
                }`}
                style={{ borderColor: theme.border }}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {profile?.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photoUrl}
                      alt={`Foto ${fullName}`}
                      className={`h-24 w-24 shrink-0 object-cover ${
                        selectedTheme === "monochrome"
                          ? "rounded-none"
                          : "rounded-full"
                      }`}
                      style={{ border: `2px solid ${theme.soft}` }}
                    />
                  )}

                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold tracking-[3px]"
                      style={{ color: theme.accent }}
                    >
                      CURRICULUM VITAE
                    </p>

                    <h1
                      className={`mt-2 break-words text-3xl font-bold ${
                        selectedTheme === "minimal" ? "font-normal" : ""
                      }`}
                    >
                      {fullName}
                    </h1>

                    <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                      {profile?.major || "Jurusan belum diisi"}
                      {profile?.school ? ` | ${profile.school}` : ""}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs"
                  style={{ color: theme.muted }}
                >
                  {email && (
                    <span className="flex items-center gap-1.5 break-all">
                      <Mail size={14} />
                      {email}
                    </span>
                  )}

                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      {profile.phone}
                    </span>
                  )}

                  {profile?.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {profile.address}
                    </span>
                  )}
                </div>
              </div>

              {twoColumn ? (
                <div className="grid grid-cols-1 gap-7 pt-7 sm:grid-cols-[0.85fr_1.15fr]">
                  <div className="space-y-7">
                    {profileSection}
                    {educationSection}
                    {skillsSection}
                  </div>

                  <div className="space-y-7">
                    {projectsSection}
                    {certificatesSection}
                    {achievementsSection}
                  </div>
                </div>
              ) : (
                <div className="space-y-7 pt-7">
                  {profileSection}
                  {educationSection}
                  {skillsSection}
                  {projectsSection}
                  {certificatesSection}
                  {achievementsSection}
                </div>
              )}

              <div
                className="mt-10 border-t pt-4 text-center text-[10px]"
                style={{
                  borderColor: theme.border,
                  color: theme.muted,
                }}
              >
                Dibuat menggunakan SkillTrack Student Portfolio Platform
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-5 text-slate-500">
              Pastikan informasi CV sudah benar sebelum mengunduh.
            </p>

            <button
              type="button"
              onClick={handleDownload}
              disabled={generatingPdf}
              className={primaryButtonClass}
            >
              {generatingPdf ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}
              {generatingPdf ? "Membuat PDF..." : "Unduh CV PDF"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}