
"use client";

import { useState, useSyncExternalStore } from "react";
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
import { getRegisteredStudents } from "@/lib/auth";
import { getStudentProfile } from "@/lib/profile";
import { getPublicationSettings } from "@/lib/publication";

function subscribeToDirectory(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("skilltrack-publication", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skilltrack-publication", callback);
  };
}

function getDirectorySnapshot() {
  if (typeof window === "undefined") return "";

  try {
    return [
      localStorage.getItem("skilltrack_users") ?? "",
      localStorage.getItem("skilltrack_publication") ?? "",
      localStorage.getItem("skilltrack_profiles") ?? "",
    ].join("|");
  } catch {
    return "";
  }
}

function getServerSnapshot() {
  return "";
}

export default function DirectoryPage() {
  const [search, setSearch] = useState("");

  useSyncExternalStore(
    subscribeToDirectory,
    getDirectorySnapshot,
    getServerSnapshot
  );

  const publicStudents = getRegisteredStudents()
    .filter((student) => getPublicationSettings(student.id).isPublic)
    .map((student) => ({
      ...student,
      profile: getStudentProfile(student.id),
    }));

  const filteredStudents = publicStudents.filter((student) => {
    const keyword = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(keyword) ||
      (student.profile?.fullName ?? "").toLowerCase().includes(keyword) ||
      (student.profile?.major ?? "").toLowerCase().includes(keyword) ||
      (student.profile?.school ?? "").toLowerCase().includes(keyword)
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
                {publicStudents.length}
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

        {filteredStudents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => {
              const profile = student.profile;

              return (
                <article
                  key={student.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-2 bg-[#0756A5]" />

                  <div className="p-6">
                    <div className="mb-5 flex items-center gap-4">
                      {profile?.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.photoUrl}
                          alt={profile.fullName || student.name}
                          className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0756A5]">
                          <UserRound size={30} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#25364A]">
                          {profile?.fullName || student.name}
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
                          {profile?.major || "Jurusan belum diisi"}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <Users
                          size={18}
                          className="mt-0.5 shrink-0 text-[#0756A5]"
                        />
                        <span>
                          {profile?.school || "Sekolah belum diisi"}
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
              );
            })}
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
