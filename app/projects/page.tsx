
"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  ExternalLink,
  X,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import {
  getStudentProjects,
  saveStudentProjects,
  type StudentProject,
} from "@/lib/projects";

type ProjectForm = {
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
};

const initialForm: ProjectForm = {
  title: "",
  category: "",
  description: "",
  technologies: "",
  year: new Date().getFullYear().toString(),
  link: "",
};

function getSafeExternalUrl(value: string): string | null {
  if (!value.trim()) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  return localStorage.getItem("skilltrack_current_user");
}

function getServerAuthSnapshot() {
  return undefined;
}

function ProjectsManager({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<StudentProject[]>(
    () => getStudentProjects(userId)
  );

  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function updateField(field: keyof ProjectForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedLink = form.link.trim();

    if (trimmedLink && !getSafeExternalUrl(trimmedLink)) {
      window.alert(
        "Link proyek tidak valid. Gunakan alamat yang diawali https:// atau http://."
      );
      return;
    }

    const projectData: StudentProject = {
      id: editingId ?? crypto.randomUUID(),
      userId,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      technologies: form.technologies.trim(),
      year: form.year,
      link: trimmedLink,
      createdAt: editingId
        ? projects.find((project) => project.id === editingId)?.createdAt ??
          new Date().toISOString()
        : new Date().toISOString(),
    };

    const updatedProjects = editingId
      ? projects.map((project) =>
          project.id === editingId ? projectData : project
        )
      : [projectData, ...projects];

    setProjects(updatedProjects);
    saveStudentProjects(userId, updatedProjects);
    resetForm();
  }

  function handleEdit(project: StudentProject) {
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      technologies: project.technologies,
      year: project.year,
      link: project.link,
    });

    setEditingId(project.id);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(projectId: string) {
    if (!window.confirm("Yakin ingin menghapus proyek ini?")) return;

    const updatedProjects = projects.filter(
      (project) => project.id !== projectId
    );

    setProjects(updatedProjects);
    saveStudentProjects(userId, updatedProjects);
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <header className="border-b border-gray-200 bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#0756A5]">
            SkillTrack
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0756A5]"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#0756A5]">
              PORTOFOLIO SISWA
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#25364A] md:text-3xl">
              Proyek Saya
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Kelola dan dokumentasikan proyek yang pernah kamu kerjakan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            Tambah Proyek
          </button>
        </div>

        {showForm && (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#25364A]">
                {editingId ? "Edit Proyek" : "Tambah Proyek Baru"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Tutup formulir"
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nama Proyek *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Contoh: Smart Feeder IoT"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kategori *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  >
                    <option value="">Pilih kategori</option>
                    <option value="Web Development">Web Development</option>
                    <option value="IoT dan Robotika">IoT dan Robotika</option>
                    <option value="Elektronika">Elektronika</option>
                    <option value="Pemrograman">Pemrograman</option>
                    <option value="Desain">Desain</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tahun Pengerjaan *
                  </label>
                  <input
                    required
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={(event) => updateField("year", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Deskripsi Proyek *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Jelaskan tujuan, cara kerja, dan hasil proyek..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Teknologi yang Digunakan *
                </label>
                <input
                  required
                  value={form.technologies}
                  onChange={(event) =>
                    updateField("technologies", event.target.value)
                  }
                  placeholder="Contoh: ESP32, Arduino IDE, C++"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Pisahkan beberapa teknologi menggunakan koma.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link Proyek (Opsional)
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(event) => updateField("link", event.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Gunakan alamat yang diawali https:// atau http://.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Proyek"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#25364A]">
              Daftar Proyek
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0756A5]">
              {projects.length} Proyek
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0756A5]">
                <FolderKanban size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-[#25364A]">
                Belum Ada Proyek
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Tambahkan proyek yang pernah kamu kerjakan untuk membangun portofolio digital.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-lg bg-[#0756A5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Tambah Proyek Pertama
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((project) => {
                const safeProjectLink = getSafeExternalUrl(project.link);

                return (
                  <article
                    key={project.id}
                    className="rounded-xl border border-gray-200 bg-white p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#0756A5]">
                          {project.category}
                        </span>
                        <h3 className="mt-4 text-lg font-bold text-[#25364A]">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Tahun {project.year}
                        </p>
                      </div>
                      <FolderKanban
                        size={23}
                        className="shrink-0 text-[#0756A5]"
                      />
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {project.description}
                    </p>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500">
                        TEKNOLOGI
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {project.technologies}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      {safeProjectLink ? (
                        <a
                          href={safeProjectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-medium text-[#0756A5] hover:underline"
                        >
                          Lihat Proyek
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {project.link ? "Link tidak valid" : "Tidak ada link"}
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#0756A5]"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  const userId = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  useEffect(() => {
    if (userId === null) {
      router.replace("/login");
    }
  }, [userId, router]);

  if (userId === undefined || userId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat proyek...</p>
      </main>
    );
  }

  const user = getCurrentUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat proyek...</p>
      </main>
    );
  }

  return <ProjectsManager userId={user.id} />;
}
