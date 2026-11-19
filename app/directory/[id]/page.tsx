
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  Trophy,
  UserRound,
  CalendarDays,
  FolderOpen,
  FileText,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ id: string }>;
};

type PublicProfile = {
  id: string;
  fullName: string;
  major: string;
  school: string;
  photoUrl: string;
  bio: string;
  startYear: string;
  graduationYear: string;
};

type PublicProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
};

type PublicCertificate = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  imageDataUrl: string;
};

type PublicAchievement = {
  id: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  description: string;
  imageDataUrl: string;
};

type PublicPortfolio = {
  profile: PublicProfile | null;
  projects: PublicProject[];
  certificates: PublicCertificate[];
  achievements: PublicAchievement[];
};

function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
      <p className="text-sm font-medium text-gray-500">
        Memuat portofolio siswa...
      </p>
    </main>
  );
}

function NotFoundPage() {
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

export default function StudentDetailPage({ params }: PageProps) {
  const [studentId, setStudentId] = useState("");
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function resolveParams() {
      try {
        const resolvedParams = await params;

        if (mounted) {
          setStudentId(resolvedParams.id);
        }
      } catch (err) {
        console.error("Gagal membaca parameter halaman:", err);

        if (mounted) {
          setError("Alamat portofolio tidak valid.");
          setLoading(false);
        }
      }
    }

    resolveParams();

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!studentId) return;

    let mounted = true;

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase.rpc(
          "get_public_student_portfolio",
          {
            student_id: studentId,
          }
        );

        if (fetchError) {
          throw fetchError;
        }

        if (!mounted) return;

        if (!data || !data.profile) {
          setPortfolio(null);
          return;
        }

        setPortfolio(data as PublicPortfolio);
      } catch (err) {
        console.error("Gagal mengambil portofolio:", err);

        if (mounted) {
          setError("Gagal memuat portofolio. Silakan coba kembali.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#25364A]">
            Portofolio Gagal Dimuat
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Muat Ulang
          </button>
        </div>
      </main>
    );
  }

  if (!portfolio || !portfolio.profile) {
    return <NotFoundPage />;
  }

  const { profile, projects, certificates, achievements } = portfolio;

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-r from-[#0756A5] to-blue-400" />

          <div className="px-6 pb-8">
            <div className="-mt-14 mb-5">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
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
                  {profile.fullName || "Siswa"}
                </h1>

                <p className="mt-2 text-gray-600">
                  {profile.major || "Jurusan belum diisi"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile.school || "Sekolah belum diisi"}
                </p>

                <Link
                  href={`/directory/${studentId}/cv`}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  <FileText size={17} />
                  Lihat CV
                </Link>
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
            {profile.bio || "Belum ada deskripsi profil."}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#25364A]">
            <GraduationCap className="text-[#0756A5]" size={21} />
            Riwayat Pendidikan
          </h2>

          <div className="border-l-2 border-blue-100 pl-5">
            <h3 className="font-semibold text-[#25364A]">
              {profile.school || "Sekolah belum diisi"}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {profile.major || "Jurusan belum diisi"}
            </p>

            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays size={14} />
              {profile.startYear || "-"} – {profile.graduationYear || "-"}
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
