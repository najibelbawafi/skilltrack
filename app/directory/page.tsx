
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  GraduationCap,
  ArrowRight,
  UserRound,
  FileText,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";

type PublicStudent = {
  id: string;
  full_name: string;
  major: string;
  school: string;
  photo_url: string;
};

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [publicStudents, setPublicStudents] = useState<PublicStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPublicStudents() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase.rpc(
          "get_public_students"
        );

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setPublicStudents((data ?? []) as PublicStudent[]);
        }
      } catch (err) {
        console.error("Gagal mengambil direktori siswa:", err);

        if (mounted) {
          setError(
            "Gagal memuat direktori siswa. Silakan coba kembali."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPublicStudents();

    return () => {
      mounted = false;
    };
  }, []);

  const keyword = search.trim().toLowerCase();

  const filteredStudents = publicStudents.filter((student) => {
    return (
      student.full_name.toLowerCase().includes(keyword) ||
      student.major.toLowerCase().includes(keyword) ||
      student.school.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#0756A5]">
            Student Directory
          </p>

          <h1 className="text-3xl font-bold text-[#25364A] md:text-4xl">
            Direktori Siswa
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Kenali profil, kompetensi, dan karya siswa yang telah
            mempublikasikan portofolionya di SkillTrack.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
              <Users size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Siswa terpublikasi
              </p>
              <p className="text-2xl font-bold text-[#25364A]">
                {loading ? "..." : publicStudents.length}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, jurusan, atau sekolah..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              Memuat direktori siswa...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-[#25364A]">
              Direktori gagal dimuat
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Muat Ulang
            </button>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <article
                key={student.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="h-2 bg-[#0756A5]" />

                <div className="p-6">
                  <div className="mb-5 flex items-center gap-4">
                    {student.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.photo_url}
                        alt={student.full_name}
                        className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0756A5]">
                        <UserRound size={30} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-[#25364A]">
                        {student.full_name}
                      </h2>

                      <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Publik
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <GraduationCap
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0756A5]"
                      />
                      <span>
                        {student.major || "Jurusan belum diisi"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Users
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0756A5]"
                      />
                      <span>
                        {student.school || "Sekolah belum diisi"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link
                      href={`/directory/${student.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      Lihat Portofolio
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      href={`/directory/${student.id}/cv`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0756A5] px-3 py-3 text-center text-sm font-semibold text-[#0756A5] transition hover:bg-blue-50"
                    >
                      <FileText size={16} />
                      Lihat CV
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Users
              className="mx-auto mb-4 text-gray-400"
              size={40}
            />

            <h2 className="text-lg font-semibold text-[#25364A]">
              {search
                ? "Siswa tidak ditemukan"
                : "Belum ada siswa yang dipublikasikan"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Siswa yang mengatur portofolionya menjadi Publik akan muncul di sini."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
