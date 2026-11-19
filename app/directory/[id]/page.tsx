
"use client";

import { Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  Trophy,
  UserRound,
  CalendarDays,
  FolderOpen,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { getRegisteredStudents } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getStudentProjects } from "@/lib/projects";
import { getStudentCertificates } from "@/lib/certificates";
import { getStudentAchievements } from "@/lib/achievements";
import { getPublicationSettings } from "@/lib/publication";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("skilltrack-publication", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skilltrack-publication", callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return "";

  try {
    return [
      "skilltrack_users",
      "skilltrack_publication",
      "skilltrack_profiles",
      "skilltrack_projects",
      "skilltrack_certificates",
      "skilltrack_achievements",
    ]
      .map((key) => localStorage.getItem(key) ?? "")
      .join("|");
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <p className="text-sm font-medium text-gray-500">
        Memuat portofolio siswa...
      </p>
    </main>
  );
}

function StudentDetailContent() {
  const params = useParams<{ id: string }>();
  const studentId = params.id;

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const student = getRegisteredStudents().find(
    (item) => item.id === studentId
  );

  const isPublic = student
    ? getPublicationSettings(student.id).isPublic
    : false;

  if (!student || !isPublic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-6">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto mb-4 text-gray-400" size={42} />

          <h1 className="text-xl font-bold text-[#25364A]">
            Profil Tidak Ditemukan
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Profil mungkin tidak tersedia atau sudah diatur menjadi privat.
          </p>

          <Link
            href="/directory"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <ArrowLeft size={17} />
            Kembali ke Direktori
          </Link>
        </div>
      </main>
    );
  }

  const profile = getStudentProfile(studentId);
  const projects = getStudentProjects(studentId);
  const certificates = getStudentCertificates(studentId);
  const achievements = getStudentAchievements(studentId);

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-r from-[#0756A5] to-blue-400" />

          <div className="px-6 pb-8">
            <div className="-mt-14 mb-5">
              {profile?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName || student.name}
                  className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-[#0756A5] shadow-sm">
                  <UserRound size={48} />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Portofolio Publik
                </span>

                <h1 className="mt-3 text-3xl font-bold text-[#25364A]">
                  {profile?.fullName || student.name}
                </h1>

                <p className="mt-2 text-gray-600">
                  {profile?.major || "Jurusan belum diisi"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile?.school || "Sekolah belum diisi"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Proyek</p>
                  <p className="text-xl font-bold text-[#25364A]">
                    {projects.length}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Sertifikat</p>
                  <p className="text-xl font-bold text-[#25364A]">
                    {certificates.length}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Pencapaian</p>
                  <p className="text-xl font-bold text-[#25364A]">
                    {achievements.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <UserRound className="text-[#0756A5]" size={20} />
            Tentang Saya
          </h2>

          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
            {profile?.bio || "Belum ada deskripsi profil."}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <GraduationCap className="text-[#0756A5]" size={21} />
            Riwayat Pendidikan
          </h2>

          <div className="border-l-2 border-blue-100 pl-5">
            <h3 className="font-semibold text-[#25364A]">
              {profile?.school || "Sekolah belum diisi"}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {profile?.major || "Jurusan belum diisi"}
            </p>

            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays size={14} />
              {profile?.startYear || "-"} – {profile?.graduationYear || "-"}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <BriefcaseBusiness className="text-[#0756A5]" size={21} />
            Proyek Saya
          </h2>

          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <h3 className="font-semibold text-[#25364A]">
                    {project.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-[#0756A5]">
                    {project.category} · {project.year}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {project.description}
                  </p>

                  {project.technologies && (
                    <p className="mt-3 text-xs text-gray-500">
                      Teknologi: {project.technologies}
                    </p>
                  )}

                  {project.link &&
                    /^https?:\/\//i.test(project.link.trim()) && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-semibold text-[#0756A5] hover:underline"
                      >
                        Lihat Proyek
                      </a>
                    )}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Belum ada proyek yang ditambahkan.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <Award className="text-[#0756A5]" size={21} />
            Sertifikat
          </h2>

          {certificates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <h3 className="font-semibold text-[#25364A]">
                      {certificate.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {certificate.issuer}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {certificate.issueDate}
                    </p>

                    {certificate.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {certificate.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Belum ada sertifikat yang ditambahkan.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <Trophy className="text-[#0756A5]" size={21} />
            Pencapaian
          </h2>

          {achievements.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <h3 className="font-semibold text-[#25364A]">
                      {achievement.title}
                    </h3>

                    <p className="mt-1 text-sm text-[#0756A5]">
                      {achievement.category}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {achievement.organizer}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {achievement.date}
                    </p>

                    {achievement.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Belum ada pencapaian yang ditambahkan.
            </p>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-lg border border-[#0756A5] px-5 py-3 text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
          >
            <FolderOpen size={17} />
            Kembali ke Direktori Siswa
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <StudentDetailContent />
    </Suspense>
  );
}
