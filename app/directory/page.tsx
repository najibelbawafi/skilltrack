
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Users,
  GraduationCap,
  ArrowRight,
  UserRound,
  FileText,
  X,
  RefreshCw,
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

      setPublicStudents((data ?? []) as PublicStudent[]);
    } catch (err) {
      console.error("Gagal mengambil direktori siswa:", err);
      setError("Gagal memuat direktori siswa. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function fetchStudents() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase.rpc(
          "get_public_students"
        );

        if (fetchError) throw fetchError;

        if (mounted) {
          setPublicStudents((data ?? []) as PublicStudent[]);
        }
      } catch (err) {
        console.error("Gagal mengambil direktori siswa:", err);

        if (mounted) {
          setError("Gagal memuat direktori siswa. Silakan coba kembali.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchStudents();

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
    <main className="min-h-screen">
      <PageHeader />

      <section className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-bold tracking-[0.18em] text-[#0756A5]">
            STUDENT DIRECTORY
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#25364A] md:text-4xl">
            Direktori Siswa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
            Kenali profil, kompetensi, dan karya siswa yang telah
            mempublikasikan portofolionya di SkillTrack.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="glass-card mt-8 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
              <Users size={25} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Siswa terpublikasi
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#25364A]">
                {loading ? "..." : publicStudents.length}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, jurusan, atau sekolah..."
              aria-label="Cari siswa"
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-3.5 pl-11 pr-11 text-sm text-gray-800 outline-none backdrop-blur-xl transition placeholder:text-gray-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </motion.div>

        <div className="mt-9 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#25364A]">
              Profil Siswa
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Sedang mengambil data siswa..."
                : `${filteredStudents.length} siswa ditemukan`}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card mt-5 flex flex-col items-center px-6 py-16 text-center"
            >
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-100 border-t-[#0756A5]" />
              <p className="mt-4 text-sm text-gray-500">
                Memuat direktori siswa...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mt-5 px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <RefreshCw size={25} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-[#25364A]">
                Direktori gagal dimuat
              </h2>

              <p className="mt-2 text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={loadPublicStudents}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <RefreshCw size={16} />
                Muat Ulang
              </button>
            </motion.div>
          ) : filteredStudents.length > 0 ? (
            <motion.div
              key="students"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <motion.article
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.04, 0.2),
                    }}
                    className="glass-card group overflow-hidden"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[#0756A5] via-blue-400 to-blue-200" />

                    <div className="p-5 md:p-6">
                      <div className="flex items-center gap-4">
                        {student.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={student.photo_url}
                            alt={student.full_name}
                            className="h-16 w-16 shrink-0 rounded-2xl border border-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                            <UserRound size={29} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-[#25364A]">
                            {student.full_name}
                          </h3>

                          <span className="mt-1.5 inline-flex items-center rounded-full border border-green-100 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-700">
                            Publik
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4 border-t border-white/80 pt-5">
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                            <GraduationCap size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Jurusan</p>
                            <p className="mt-0.5 break-words font-medium text-[#25364A]">
                              {student.major || "Jurusan belum diisi"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                            <Users size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Sekolah</p>
                            <p className="mt-0.5 break-words font-medium text-[#25364A]">
                              {student.school || "Sekolah belum diisi"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Link
                          href={`/directory/${student.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-3 py-3 text-center text-xs font-semibold text-white transition hover:bg-blue-800 sm:text-sm"
                        >
                          Portofolio
                          <ArrowRight size={15} />
                        </Link>

                        <Link
                          href={`/directory/${student.id}/cv`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0756A5]/20 bg-white/70 px-3 py-3 text-center text-xs font-semibold text-[#0756A5] transition hover:border-[#0756A5] hover:bg-blue-50 sm:text-sm"
                        >
                          <FileText size={16} />
                          Lihat CV
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card mt-5 px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-300">
                <Users size={32} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#25364A]">
                {search
                  ? "Siswa tidak ditemukan"
                  : "Belum ada siswa yang dipublikasikan"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Siswa yang mengatur portofolionya menjadi Publik akan muncul di sini."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 text-sm font-semibold text-[#0756A5] hover:underline"
                >
                  Hapus pencarian
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
