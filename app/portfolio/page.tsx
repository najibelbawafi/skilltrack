
"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";
import {
  getPublicationSettings,
  savePublicationSettings,
} from "@/lib/publication";

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

  function handlePublicationToggle() {
    if (!userId) return;

    savePublicationSettings(userId, !isPublic);
    window.dispatchEvent(new Event("skilltrack-publication"));
  }

  if (userId === undefined || userId === null || !user) {
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

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0756A5] hover:underline"
          >
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </Link>

          <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold text-[#0756A5]">
            PREVIEW PORTOFOLIO
          </span>
        </div>

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

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[#0756A5] px-6 py-10 text-white md:px-10">
            <p className="text-sm font-medium tracking-wider text-blue-100">
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
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-white text-4xl font-bold text-[#0756A5]">
                  {initial}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  {fullName}
                </h1>

                <p className="mt-2 text-blue-100">
                  {profile?.major || "Jurusan belum diisi"}
                </p>

                <p className="mt-1 text-sm text-blue-100">
                  {profile?.school || "Nama sekolah belum diisi"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_2fr] md:p-10">
            <aside className="space-y-7">
              <section>
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <User size={19} className="text-[#0756A5]" />
                  Tentang Saya
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {profile?.bio || "Belum ada deskripsi diri."}
                </p>
              </section>

              <section>
                <h2 className="font-bold text-[#25364A]">
                  Informasi Kontak
                </h2>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <p className="flex items-start gap-2 break-all">
                    <Mail size={17} className="mt-0.5 shrink-0 text-[#0756A5]" />
                    {profile?.email || user.email}
                  </p>

                  {profile?.phone && (
                    <p className="flex items-start gap-2">
                      <Phone size={17} className="mt-0.5 shrink-0 text-[#0756A5]" />
                      {profile.phone}
                    </p>
                  )}

                  {profile?.address && (
                    <p className="flex items-start gap-2">
                      <MapPin size={17} className="mt-0.5 shrink-0 text-[#0756A5]" />
                      {profile.address}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="flex items-center gap-2 font-bold text-[#25364A]">
                  <GraduationCap size={19} className="text-[#0756A5]" />
                  Pendidikan
                </h2>

                <div className="mt-3 rounded-xl bg-[#F4F7FB] p-4">
                  <p className="font-semibold text-[#25364A]">
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
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#25364A]">
                  <FolderKanban size={20} className="text-[#0756A5]" />
                  Proyek Saya
                  <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs text-[#0756A5]">
                    {projects.length} proyek
                  </span>
                </h2>

                <div className="mt-4 space-y-3">
                  {projects.length === 0 ? (
                    <p className="rounded-xl bg-[#F4F7FB] p-4 text-sm text-gray-500">
                      Belum ada proyek yang ditambahkan.
                    </p>
                  ) : (
                    projects.map((project) => {
                      const safeUrl = getSafeExternalUrl(project.link);

                      return (
                        <article
                          key={project.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-semibold text-[#25364A]">
                              {project.title}
                            </h3>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-[#0756A5]">
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
                                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#0756A5] hover:underline"
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
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#25364A]">
                  <Award size={20} className="text-[#0756A5]" />
                  Sertifikat
                  <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs text-[#0756A5]">
                    {certificates.length} sertifikat
                  </span>
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {certificates.length === 0 ? (
                    <p className="rounded-xl bg-[#F4F7FB] p-4 text-sm text-gray-500 sm:col-span-2">
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
                          className="overflow-hidden rounded-xl border border-gray-200"
                        >
                          {certificate.imageDataUrl && (
                            <img
                              src={certificate.imageDataUrl}
                              alt={`Sertifikat ${certificate.title}`}
                              className="h-36 w-full object-cover"
                            />
                          )}

                          <div className="p-4">
                            <h3 className="font-semibold text-[#25364A]">
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
                                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#0756A5] hover:underline"
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
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#25364A]">
                  <Trophy size={20} className="text-[#0756A5]" />
                  Pencapaian
                  <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs text-[#0756A5]">
                    {achievements.length} pencapaian
                  </span>
                </h2>

                <div className="mt-4 space-y-3">
                  {achievements.length === 0 ? (
                    <p className="rounded-xl bg-[#F4F7FB] p-4 text-sm text-gray-500">
                      Belum ada pencapaian yang ditambahkan.
                    </p>
                  ) : (
                    achievements.map((achievement) => (
                      <article
                        key={achievement.id}
                        className="overflow-hidden rounded-xl border border-gray-200 sm:flex"
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
                            <h3 className="font-semibold text-[#25364A]">
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
  );
}
