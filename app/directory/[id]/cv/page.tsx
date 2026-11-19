
"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  FolderKanban,
  Award,
  Trophy,
  FileText,
} from "lucide-react";

import { getRegisteredStudents } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";
import { getStudentSkills } from "@/lib/skills";
import { getCVPublicationSettings } from "@/lib/cv-publication";

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
  accent: string;
  soft: string;
  text: string;
  muted: string;
  border: string;
};

const CV_THEMES: ThemeConfig[] = [
  {
    id: "formal",
    name: "Formal Blue",
    accent: "#0756A5",
    soft: "#EAF3FC",
    text: "#25364A",
    muted: "#64748B",
    border: "#0756A5",
  },
  {
    id: "modern",
    name: "Modern",
    accent: "#087E8B",
    soft: "#E6F5F5",
    text: "#263445",
    muted: "#64748B",
    border: "#087E8B",
  },
  {
    id: "minimal",
    name: "Minimalis",
    accent: "#555555",
    soft: "#F1F1F1",
    text: "#333333",
    muted: "#777777",
    border: "#777777",
  },
  {
    id: "executive",
    name: "Executive",
    accent: "#17365D",
    soft: "#E9EEF5",
    text: "#202A36",
    muted: "#68778A",
    border: "#17365D",
  },
  {
    id: "creative",
    name: "Creative",
    accent: "#C05A35",
    soft: "#FFF0E9",
    text: "#303044",
    muted: "#777080",
    border: "#C05A35",
  },
  {
    id: "technical",
    name: "Technical",
    accent: "#087F5B",
    soft: "#E6F5EF",
    text: "#203047",
    muted: "#64748B",
    border: "#087F5B",
  },
  {
    id: "two-column",
    name: "Two Column",
    accent: "#3867A6",
    soft: "#EDF2FA",
    text: "#27364B",
    muted: "#64748B",
    border: "#3867A6",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    accent: "#222222",
    soft: "#EEEEEE",
    text: "#222222",
    muted: "#666666",
    border: "#333333",
  },
];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("skilltrack-cv-publication", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skilltrack-cv-publication", callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return "";

  const keys = [
    "skilltrack_users",
    "skilltrack_cv_publication",
    "skilltrack_profiles",
    "skilltrack_projects",
    "skilltrack_certificates",
    "skilltrack_achievements",
    "skilltrack_skills",
  ];

  try {
    return keys
      .map((key) => localStorage.getItem(key) ?? "")
      .join("|");
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function isCVTheme(value: string | null): value is CVTheme {
  return CV_THEMES.some((theme) => theme.id === value);
}

function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <p className="text-sm text-gray-500">Memuat CV siswa...</p>
    </main>
  );
}

function NotAvailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-5">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <FileText size={42} className="mx-auto mb-4 text-gray-400" />

        <h1 className="text-xl font-bold text-[#25364A]">
          CV Tidak Tersedia
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          CV siswa ini tidak ditemukan atau belum dipublikasikan.
        </p>

        <Link
          href="/directory"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <ArrowLeft size={17} />
          Kembali ke Direktori
        </Link>
      </div>
    </main>
  );
}

export default function PublicCVPage() {
  const params = useParams<{ id: string }>();
  const studentId = params.id;

  useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const student = getRegisteredStudents().find(
    (item) => item.id === studentId
  );

  const publication = student
    ? getCVPublicationSettings(student.id)
    : null;

  const isPublic = publication?.isPublic === true;

  if (!student || !isPublic) {
    return <NotAvailablePage />;
  }

  const profile = getStudentProfile(studentId);
  const projects = getStudentProjects(studentId);
  const certificates = getStudentCertificates(studentId);
  const achievements = getStudentAchievements(studentId);
  const skills = getStudentSkills(studentId);

  const savedTheme = localStorage.getItem(
    `skilltrack_cv_theme_${studentId}`
  );

  const selectedTheme = isCVTheme(savedTheme)
    ? savedTheme
    : "formal";

  const theme =
    CV_THEMES.find((item) => item.id === selectedTheme) ??
    CV_THEMES[0];

  const fullName = profile?.fullName || student.name;
  const isTwoColumn = selectedTheme === "two-column";

  const sectionTitle = (
    icon: React.ReactNode,
    title: string
  ) => (
    <h2
      className="mb-4 flex items-center gap-2 border-b pb-2 text-base font-bold"
      style={{
        color: theme.text,
        borderColor: theme.border,
      }}
    >
      <span style={{ color: theme.accent }}>{icon}</span>
      {title}
    </h2>
  );

  const profileSection = (
    <section>
      {sectionTitle(<UserRound size={18} />, "PROFIL SINGKAT")}

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
      {sectionTitle(<GraduationCap size={18} />, "PENDIDIKAN")}

      <h3 className="font-semibold" style={{ color: theme.text }}>
        {profile?.school || "Sekolah belum diisi"}
      </h3>

      <p className="mt-1 text-sm" style={{ color: theme.muted }}>
        {profile?.major || "Jurusan belum diisi"}
      </p>

      <p className="mt-1 text-xs" style={{ color: theme.muted }}>
        {profile?.startYear || "-"} - {profile?.graduationYear || "-"}
      </p>
    </section>
  );

  const skillsSection = (
    <section>
      {sectionTitle(<BriefcaseBusiness size={18} />, "KETERAMPILAN")}

      {skills.length > 0 ? (
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
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada keterampilan yang ditambahkan.
        </p>
      )}
    </section>
  );

  const projectsSection = (
    <section>
      {sectionTitle(<FolderKanban size={18} />, "PROYEK")}

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <article key={project.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <h3
                  className="font-semibold"
                  style={{ color: theme.text }}
                >
                  {project.title}
                </h3>

                <span className="text-xs" style={{ color: theme.muted }}>
                  {project.year || "-"}
                </span>
              </div>

              <p
                className="mt-1 text-xs font-medium"
                style={{ color: theme.accent }}
              >
                {project.category}
              </p>

              <p
                className="mt-2 whitespace-pre-line text-sm leading-6"
                style={{ color: theme.muted }}
              >
                {project.description}
              </p>

              {project.technologies && (
                <p className="mt-2 text-xs" style={{ color: theme.muted }}>
                  Teknologi: {project.technologies}
                </p>
              )}

              {project.link &&
                /^https?:\/\//i.test(project.link.trim()) && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold hover:underline"
                    style={{ color: theme.accent }}
                  >
                    Lihat Proyek
                  </a>
                )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada proyek.
        </p>
      )}
    </section>
  );

  const certificatesSection = (
    <section>
      {sectionTitle(<Award size={18} />, "SERTIFIKAT")}

      {certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((certificate) => (
            <article
              key={certificate.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              {certificate.imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={certificate.imageDataUrl}
                  alt={certificate.title}
                  className="h-44 w-full bg-gray-50 object-contain"
                />
              )}

              <div className="p-4">
                <h3
                  className="font-semibold"
                  style={{ color: theme.text }}
                >
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
                    className="mt-2 text-sm leading-6"
                    style={{ color: theme.muted }}
                  >
                    {certificate.description}
                  </p>
                )}

                {certificate.credentialUrl &&
                  /^https?:\/\//i.test(certificate.credentialUrl.trim()) && (
                    <a
                      href={certificate.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-semibold hover:underline"
                      style={{ color: theme.accent }}
                    >
                      Lihat Kredensial
                    </a>
                  )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada sertifikat.
        </p>
      )}
    </section>
  );

  const achievementsSection = (
    <section>
      {sectionTitle(<Trophy size={18} />, "PENCAPAIAN")}

      {achievements.length > 0 ? (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <article
              key={achievement.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              {achievement.imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={achievement.imageDataUrl}
                  alt={achievement.title}
                  className="h-44 w-full bg-gray-50 object-cover"
                />
              )}

              <div className="p-4">
                <h3
                  className="font-semibold"
                  style={{ color: theme.text }}
                >
                  {achievement.title}
                </h3>

                <p
                  className="mt-1 text-xs font-medium"
                  style={{ color: theme.accent }}
                >
                  {achievement.category}
                </p>

                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  {achievement.organizer}
                </p>

                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                  {formatDate(achievement.date)}
                </p>

                {achievement.description && (
                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: theme.muted }}
                  >
                    {achievement.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada pencapaian.
        </p>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#0756A5]"
          >
            <ArrowLeft size={18} />
            Kembali ke Direktori
          </Link>

          <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            CV Publik
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div
          className="mx-auto min-h-[900px] w-full max-w-[794px] rounded-xl p-6 shadow-sm sm:p-10"
          style={{
            color: theme.text,
            backgroundColor: "#FFFFFF",
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
                  className={`h-24 w-24 object-cover ${
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

                <h1 className="mt-2 break-words text-3xl font-bold">
                  {fullName}
                </h1>

                <p
                  className="mt-2 text-sm"
                  style={{ color: theme.muted }}
                >
                  {profile?.major || "Jurusan belum diisi"}
                  {profile?.school ? ` | ${profile.school}` : ""}
                </p>
              </div>
            </div>
          </div>

          {isTwoColumn ? (
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
    </main>
  );
}
