
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
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
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";
import {
  getStudentSkills,
  saveStudentSkills,
  type StudentSkill,
} from "@/lib/skills";
import { downloadElementAsPDF } from "@/lib/pdf";
import {
  getCVPublicationSettings,
  saveCVPublicationSettings,
} from "@/lib/cv-publication";

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

export default function CVPage() {
  const router = useRouter();
  const cvRef = useRef<HTMLDivElement>(null);

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

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<CVTheme>("formal");
  const [cvIsPublic, setCvIsPublic] = useState(false);

  useEffect(() => {
    if (userId === null || (userId && !user)) {
      router.replace("/login");
    }
  }, [userId, user, router]);

  useEffect(() => {
    if (!userId) return;

    setSkills(getStudentSkills(userId));

    const savedTheme = localStorage.getItem(
      `skilltrack_cv_theme_${userId}`
    );

    setSelectedTheme(
      isCVTheme(savedTheme) ? savedTheme : "formal"
    );

    setCvIsPublic(getCVPublicationSettings(userId).isPublic);

    setLoaded(true);
  }, [userId]);

  const theme =
    CV_THEMES.find((item) => item.id === selectedTheme) ||
    CV_THEMES[0];

  function changeTheme(themeId: CVTheme) {
    if (!userId) return;

    setSelectedTheme(themeId);

    localStorage.setItem(
      `skilltrack_cv_theme_${userId}`,
      themeId
    );
  }

  function toggleCVPublication() {
    if (!userId) return;

    const nextStatus = !cvIsPublic;

    try {
      saveCVPublicationSettings(userId, nextStatus);
      setCvIsPublic(nextStatus);
      setError("");
    } catch {
      setError("Gagal menyimpan pengaturan publikasi CV.");
    }
  }

  function addSkill() {
    const name = newSkill.trim();

    if (!name || !userId) return;

    if (
      skills.some(
        (skill) => skill.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("Keterampilan tersebut sudah ditambahkan.");
      return;
    }

    const updated = [
      ...skills,
      {
        id: crypto.randomUUID(),
        userId,
        name,
        createdAt: new Date().toISOString(),
      },
    ];

    setSkills(updated);
    saveStudentSkills(userId, updated);
    setNewSkill("");
    setError("");
  }

  function removeSkill(id: string) {
    if (!userId) return;

    const updated = skills.filter((skill) => skill.id !== id);
    setSkills(updated);
    saveStudentSkills(userId, updated);
    setError("");
  }

  async function handleDownload() {
    if (!cvRef.current || loading) return;

    setLoading(true);
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
      setLoading(false);
    }
  }

  if (userId === undefined || userId === null || !user || !loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat CV...</p>
      </main>
    );
  }

  const fullName = profile?.fullName || user.name;
  const email = profile?.email || user.email;

  const sectionTitle = (icon: ReactNode, title: string) => (
    <h2
      className="mb-3 flex items-center gap-2 border-b pb-2 text-base font-bold"
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
      {sectionTitle(<User size={18} />, "PROFIL SINGKAT")}
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
      {sectionTitle(<BriefcaseBusiness size={18} />, "KETERAMPILAN")}
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
      {sectionTitle(<FolderKanban size={18} />, "PROYEK")}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Belum ada proyek.
          </p>
        ) : (
          projects.map((project) => (
            <article key={project.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold" style={{ color: theme.text }}>
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
            </article>
          ))
        )}
      </div>
    </section>
  );

  const certificatesSection = (
    <section>
      {sectionTitle(<Award size={18} />, "SERTIFIKAT")}
      <div className="space-y-3">
        {certificates.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            Belum ada sertifikat.
          </p>
        ) : (
          certificates.map((certificate) => (
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
            </article>
          ))
        )}
      </div>
    </section>
  );

  const achievementsSection = (
    <section>
      {sectionTitle(<Trophy size={18} />, "PENCAPAIAN")}
      <div className="space-y-3">
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
              <p
                className="mt-1 text-xs"
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

  const twoColumn = selectedTheme === "two-column";

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Kembali ke dashboard"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="font-bold text-[#25364A]">CV Saya</h1>
            <p className="text-xs text-gray-500">
              Curriculum Vitae Digital
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#25364A]">
                  Publikasi CV
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Atur apakah CV dapat dilihat melalui Direktori Siswa.
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  cvIsPublic
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cvIsPublic ? "Publik" : "Privat"}
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                {cvIsPublic
                  ? "CV kamu dapat dibuka melalui Direktori Siswa."
                  : "CV kamu belum dapat dilihat oleh pengunjung Direktori Siswa."}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleCVPublication}
              className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                cvIsPublic
                  ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "bg-[#0756A5] text-white hover:bg-blue-800"
              }`}
            >
              <Globe size={17} />
              {cvIsPublic ? "Jadikan Privat" : "Publikasikan CV"}
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-[#25364A]">
              Pilih Tema CV
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Pilih desain CV. Tampilan preview akan berubah secara langsung.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {CV_THEMES.map((item) => {
                const active = selectedTheme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTheme(item.id)}
                    className={`rounded-lg border p-2 text-left transition ${
                      active
                        ? "border-[#0756A5] bg-blue-50 ring-1 ring-[#0756A5]"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className="mb-2 flex h-12 items-center justify-center rounded-md"
                      style={{ backgroundColor: item.soft }}
                    >
                      <div
                        className="h-7 w-10 rounded-sm border-t-4 bg-white shadow-sm"
                        style={{ borderColor: item.accent }}
                      >
                        <div
                          className="mx-1 mt-1 h-1 w-5 rounded"
                          style={{ backgroundColor: item.accent }}
                        />
                        <div className="mx-1 mt-1 h-1 w-7 rounded bg-gray-200" />
                        <div className="mx-1 mt-1 h-1 w-6 rounded bg-gray-200" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#25364A]">
                        {item.name}
                      </span>
                      {active && (
                        <Check size={14} className="shrink-0 text-[#0756A5]" />
                      )}
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 rounded-lg bg-green-50 p-2 text-[11px] text-green-700">
              Tema tersimpan otomatis dan akan digunakan saat mengunduh PDF.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <h2 className="font-bold text-[#25364A]">
                Keterampilan
              </h2>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Tambahkan kemampuan teknis dan nonteknis yang ingin ditampilkan
                pada CV.
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
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus size={17} />
                Tambah Keterampilan
              </button>
            </form>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <div className="space-y-2">
              {skills.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                  Belum ada keterampilan. Tambahkan keterampilan untuk
                  melengkapi CV.
                </p>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <span className="break-all text-sm text-[#25364A]">
                      {skill.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeSkill(skill.id)}
                      className="shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Hapus ${skill.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs leading-5 text-gray-500">
                Data CV tersimpan pada LocalStorage browser ini. Pastikan
                informasi profil, proyek, sertifikat, dan pencapaian sudah
                diperbarui.
              </p>
            </div>

            <Link
              href="/profile"
              className="block text-center text-sm font-semibold text-[#0756A5] hover:underline"
            >
              Edit Profil Saya
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
              <FileText size={19} className="text-[#0756A5]" />
              Preview CV
            </h2>

            <span className="text-xs text-gray-500">
              Tema: {theme.name} | Format A4
            </span>
          </div>

          <div
            ref={cvRef}
            className="mx-auto min-h-[900px] w-full max-w-[794px] p-6 shadow-sm sm:p-10"
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
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={14} />
                  {email}
                </span>

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

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}

              {loading ? "Membuat PDF..." : "Unduh CV PDF"}
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
