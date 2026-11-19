
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  ExternalLink,
  X,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";
import type { StudentProject } from "@/lib/projects";

type ProjectForm = {
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
};

type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
  created_at: string;
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

function mapProject(row: ProjectRow): StudentProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    description: row.description,
    technologies: row.technologies,
    year: row.year,
    link: row.link,
    createdAt: row.created_at,
  };
}

function ProjectsManager({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoadingProjects(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setErrorMessage("Gagal memuat proyek. Silakan coba kembali.");
        setLoadingProjects(false);
        return;
      }

      const rows = (data ?? []) as ProjectRow[];
      setProjects(rows.map(mapProject));
      setLoadingProjects(false);
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, [userId]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedLink = form.link.trim();

    if (trimmedLink && !getSafeExternalUrl(trimmedLink)) {
      window.alert(
        "Link proyek tidak valid. Gunakan alamat yang diawali https:// atau http://."
      );
      return;
    }

    const existingProject = editingId
      ? projects.find((project) => project.id === editingId)
      : undefined;

    const projectData = {
      user_id: userId,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      technologies: form.technologies.trim(),
      year: form.year,
      link: trimmedLink,
    };

    setSaving(true);
    setErrorMessage("");

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingId)
          .eq("user_id", userId)
          .select("*")
          .single();

        if (error) throw error;

        const updatedProject = mapProject(data as ProjectRow);

        setProjects((previous) =>
          previous.map((project) =>
            project.id === editingId ? updatedProject : project
          )
        );
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(projectData)
          .select("*")
          .single();

        if (error) throw error;

        const newProject = mapProject(data as ProjectRow);

        setProjects((previous) => [newProject, ...previous]);
      }

      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan proyek:", error);
      setErrorMessage(
        "Proyek gagal disimpan. Periksa koneksi dan konfigurasi Supabase."
      );
    } finally {
      setSaving(false);
    }

    void existingProject;
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

  async function handleDelete(projectId: string) {
    if (deletingId) return;

    if (!window.confirm("Yakin ingin menghapus proyek ini?")) return;

    setDeletingId(projectId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      setProjects((previous) =>
        previous.filter((project) => project.id !== projectId)
      );

      if (editingId === projectId) {
        resetForm();
      }
    } catch (error) {
      console.error("Gagal menghapus proyek:", error);
      setErrorMessage("Proyek gagal dihapus. Silakan coba kembali.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F4F7FB]">
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

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

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
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
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
                      onChange={(event) =>
                        updateField("year", event.target.value)
                      }
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
                    onChange={(event) =>
                      updateField("link", event.target.value)
                    }
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
                    disabled={saving}
                    className="rounded-lg bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Menyimpan..."
                      : editingId
                        ? "Simpan Perubahan"
                        : "Simpan Proyek"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
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

            {loadingProjects ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <p className="text-sm text-gray-500">
                  Memuat proyek dari Supabase...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0756A5]">
                  <FolderKanban size={27} />
                </div>

                <h3 className="mt-4 font-semibold text-[#25364A]">
                  Belum Ada Proyek
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  Tambahkan proyek yang pernah kamu kerjakan untuk membangun
                  portofolio digital.
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
                            {project.link
                              ? "Link tidak valid"
                              : "Tidak ada link"}
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
                            disabled={deletingId === project.id}
                            onClick={() => handleDelete(project.id)}
                            className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deletingId === project.id ? "Menghapus..." : "Hapus"}
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
    </>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat proyek...</p>
      </main>
    );
  }

  return <ProjectsManager key={user.id} userId={user.id} />;
}
