
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
  ExternalLink,
  RefreshCw,
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
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-[#0756A5]" />
        <p className="text-sm font-medium text-gray-500">
          Memuat portofolio siswa...
        </p>
      </div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <UserRound className="text-gray-400" size={30} />
        </div>

        <h1 className="text-xl font-bold text-[#25364A]">
          Profil Tidak Ditemukan
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Profil mungkin tidak tersedia atau sudah diatur menjadi privat.
        </p>

        <Link
          href="/directory"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <ArrowLeft size={17} />
          Kembali ke Direktori
        </Link>
      </div>
    </main>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
        <Icon size={20} />
      </div>

      <h2 className="text-lg font-bold tracking-tight text-[#25364A]">
        {children}
      </h2>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-8 text-center">
      <p className="text-sm text-gray-500">{children}</p>
    </div>
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

        setPortfolio({
          ...data,
          projects: Array.isArray(data.projects) ? data.projects : [],
          certificates: Array.isArray(data.certificates)
            ? data.certificates
            : [],
          achievements: Array.isArray(data.achievements)
            ? data.achievements
            : [],
        } as PublicPortfolio);
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
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <RefreshCw className="text-red-500" size={27} />
          </div>

          <h1 className="text-xl font-bold text-[#25364A]">
            Portofolio Gagal Dimuat
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  if (!portfolio || !portfolio.profile) {
    return <NotFoundPage />;
  }

  const { profile, projects, certificates, achievements } = portfolio;

  const stats = [
    {
      label: "Proyek",
      value: projects.length,
      icon: BriefcaseBusiness,
    },
    {
      label: "Sertifikat",
      value: certificates.length,
      icon: Award,
    },
    {
      label: "Pencapaian",
      value: achievements.length,
      icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {/* Profile */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#0756A5] via-[#1674C5] to-[#65A9E8] sm:h-40">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="absolute -right-5 -bottom-36 h-64 w-64 rounded-full border-[35px] border-white/10" />
          </div>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 mb-5 flex items-end justify-between sm:-mt-14">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-md sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-[#0756A5] shadow-md sm:h-28 sm:w-28">
                  <UserRound size={42} />
                </div>
              )}

              <span className="mb-1 inline-flex items-center rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                Profil Publik
              </span>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
                  {profile.fullName || "Siswa"}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                  <GraduationCap size={17} className="shrink-0 text-[#0756A5]" />
                  {profile.major || "Jurusan belum diisi"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile.school || "Sekolah belum diisi"}
                </p>

                <Link
                  href={`/directory/${studentId}/cv`}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  <FileText size={17} />
                  Lihat CV
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[330px]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 sm:p-4"
                  >
                    <stat.icon
                      size={18}
                      className="mb-3 text-[#0756A5]"
                    />

                    <p className="text-xl font-bold tabular-nums text-[#25364A] sm:text-2xl">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-gray-500 sm:text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-6 sm:p-7">
          <SectionTitle icon={UserRound}>Tentang Saya</SectionTitle>

          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
            {profile.bio || "Belum ada deskripsi profil."}
          </p>
        </section>

        {/* Education */}
        <section className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-6 sm:p-7">
          <SectionTitle icon={GraduationCap}>
            Riwayat Pendidikan
          </SectionTitle>

          <div className="relative ml-2 border-l-2 border-blue-100 py-1 pl-6">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-[#0756A5] bg-white" />

            <h3 className="font-semibold text-[#25364A]">
              {profile.school || "Sekolah belum diisi"}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {profile.major || "Jurusan belum diisi"}
            </p>

            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
              <CalendarDays size={14} />
              {profile.startYear || "-"} – {profile.graduationYear || "-"}
            </p>
          </div>
        </section>

        {/* Projects */}
        <section className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-6 sm:p-7">
          <SectionTitle icon={BriefcaseBusiness}>Proyek Saya</SectionTitle>

          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group rounded-xl border border-gray-200 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                      <FolderOpen size={19} />
                    </div>

                    {project.year && (
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        {project.year}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-semibold text-[#25364A]">
                    {project.title}
                  </h3>

                  {project.category && (
                    <p className="mt-1 text-xs font-medium text-[#0756A5]">
                      {project.category}
                    </p>
                  )}

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {project.description}
                  </p>

                  {project.technologies && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <p className="text-xs leading-5 text-gray-500">
                        <span className="font-semibold text-gray-600">
                          Teknologi:
                        </span>{" "}
                        {project.technologies}
                      </p>
                    </div>
                  )}

                  {project.link &&
                    /^https?:\/\//i.test(project.link.trim()) && (
                      <a
                        href={project.link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] transition hover:text-blue-800"
                      >
                        Lihat Proyek
                        <ExternalLink size={14} />
                      </a>
                    )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>
              Belum ada proyek yang ditambahkan.
            </EmptyState>
          )}
        </section>

        {/* Certificates */}
        <section className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-6 sm:p-7">
          <SectionTitle icon={Award}>Sertifikat</SectionTitle>

          {certificates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="overflow-hidden rounded-xl border border-gray-200 transition duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  {certificate.imageDataUrl && (
                    <div className="flex h-48 items-center justify-center overflow-hidden bg-gray-50 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={certificate.imageDataUrl}
                        alt={certificate.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-semibold text-[#25364A]">
                      {certificate.title}
                    </h3>

                    {certificate.issuer && (
                      <p className="mt-2 text-sm text-gray-600">
                        {certificate.issuer}
                      </p>
                    )}

                    {certificate.issueDate && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={14} />
                        {certificate.issueDate}
                      </p>
                    )}

                    {certificate.description && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                        {certificate.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>
              Belum ada sertifikat yang ditambahkan.
            </EmptyState>
          )}
        </section>

        {/* Achievements */}
        <section className="mt-5 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-6 sm:p-7">
          <SectionTitle icon={Trophy}>Pencapaian</SectionTitle>

          {achievements.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="overflow-hidden rounded-xl border border-gray-200 transition duration-200 hover:border-blue-200 hover:shadow-md"
                >
                  {achievement.imageDataUrl && (
                    <div className="h-48 overflow-hidden bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={achievement.imageDataUrl}
                        alt={achievement.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-semibold text-[#25364A]">
                      {achievement.title}
                    </h3>

                    {achievement.category && (
                      <p className="mt-2 inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0756A5]">
                        {achievement.category}
                      </p>
                    )}

                    {achievement.organizer && (
                      <p className="mt-3 text-sm text-gray-600">
                        {achievement.organizer}
                      </p>
                    )}

                    {achievement.date && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={14} />
                        {achievement.date}
                      </p>
                    )}

                    {achievement.description && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>
              Belum ada pencapaian yang ditambahkan.
            </EmptyState>
          )}
        </section>

        {/* Back to directory */}
        <div className="mt-8 flex justify-center pb-4">
          <Link
            href="/directory"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-[#0756A5] hover:bg-blue-50 hover:text-[#0756A5]"
          >
            <ArrowLeft size={17} />
            Kembali ke Direktori Siswa
          </Link>
        </div>
      </div>
    </main>
  );
}
