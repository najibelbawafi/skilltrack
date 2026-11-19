
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  ExternalLink,
  X,
  Code2,
  CalendarDays,
  Layers3,
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

const transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
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
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="glass-strong relative overflow-hidden rounded-[28px] p-6 md:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#0756A5]">
                  <FolderKanban size={15} />
                  PORTOFOLIO SISWA
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#25364A] md:text-3xl">
                  Proyek Saya
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  Kelola dan dokumentasikan proyek yang pernah kamu kerjakan
                  dalam satu tempat.
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="glass-button inline-flex items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition-colors hover:bg-blue-800"
              >
                <Plus size={18} />
                Tambah Proyek
              </motion.button>
            </div>
          </motion.section>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                role="alert"
                className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showForm && (
              <motion.section
                key="project-form"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={transition}
                className="glass-strong mt-7 rounded-[26px] p-5 md:p-8"
              >
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[#0756A5]">
                      {editingId ? "PERBARUI DATA" : "PROYEK BARU"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#25364A]">
                      {editingId ? "Edit Proyek" : "Tambah Proyek Baru"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Lengkapi informasi proyek yang ingin ditampilkan.
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    aria-label="Tutup formulir"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white/70 text-gray-500 transition-colors hover:bg-white hover:text-gray-800"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                      Nama Proyek *
                    </label>

                    <input
                      required
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="Contoh: Smart Feeder IoT"
                      className="w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] outline-none transition-all placeholder:text-gray-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                        Kategori *
                      </label>

                      <select
                        required
                        value={form.category}
                        onChange={(event) =>
                          updateField("category", event.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] outline-none transition-all focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
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
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
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
                        className="w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] outline-none transition-all focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
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
                      className="w-full resize-y rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm leading-6 text-[#25364A] outline-none transition-all placeholder:text-gray-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                      Teknologi yang Digunakan *
                    </label>

                    <input
                      required
                      value={form.technologies}
                      onChange={(event) =>
                        updateField("technologies", event.target.value)
                      }
                      placeholder="Contoh: ESP32, Arduino IDE, C++"
                      className="w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] outline-none transition-all placeholder:text-gray-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Pisahkan beberapa teknologi menggunakan koma.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                      Link Proyek (Opsional)
                    </label>

                    <input
                      type="url"
                      value={form.link}
                      onChange={(event) =>
                        updateField("link", event.target.value)
                      }
                      placeholder="https://github.com/username/project"
                      className="w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] outline-none transition-all placeholder:text-gray-400 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Gunakan alamat yang diawali https:// atau http://.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-gray-200/70 pt-5">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={!saving ? { y: -2 } : undefined}
                      whileTap={!saving ? { scale: 0.97 } : undefined}
                      className="rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Proyek"}
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={saving}
                      whileHover={!saving ? { y: -2 } : undefined}
                      whileTap={!saving ? { scale: 0.97 } : undefined}
                      onClick={resetForm}
                      className="rounded-xl border border-gray-200 bg-white/70 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-white disabled:opacity-50"
                    >
                      Batal
                    </motion.button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="mt-9">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#25364A]">
                  Daftar Proyek
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Semua proyek yang sudah kamu dokumentasikan.
                </p>
              </div>

              <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0756A5]">
                <FolderKanban size={15} />
                {projects.length} Proyek
              </div>
            </div>

            {loadingProjects ? (
              <div className="glass-strong rounded-[24px] px-6 py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Memuat proyek dari Supabase...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="glass-strong rounded-[26px] border border-dashed border-gray-300/80 px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <FolderKanban size={29} />
                </div>

                <h3 className="mt-5 font-semibold text-[#25364A]">
                  Belum Ada Proyek
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Tambahkan proyek yang pernah kamu kerjakan untuk membangun
                  portofolio digital.
                </p>

                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-800"
                >
                  <Plus size={17} />
                  Tambah Proyek Pertama
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-5 md:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {projects.map((project, index) => {
                    const safeProjectLink = getSafeExternalUrl(project.link);

                    return (
                      <motion.article
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{
                          ...transition,
                          delay: Math.min(index * 0.045, 0.2),
                        }}
                        whileHover={{ y: -4 }}
                        className="glass-card flex flex-col rounded-[24px] p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex rounded-full bg-blue-50/90 px-3 py-1 text-xs font-semibold text-[#0756A5]">
                              {project.category}
                            </span>

                            <h3 className="mt-4 break-words text-lg font-bold text-[#25364A]">
                              {project.title}
                            </h3>

                            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                              <CalendarDays size={13} />
                              Tahun {project.year}
                            </div>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-blue-50/80 text-[#0756A5] shadow-sm">
                            <FolderKanban size={21} />
                          </div>
                        </div>

                        <p className="mt-5 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                          {project.description}
                        </p>

                        <div className="mt-5 rounded-xl border border-white/80 bg-white/55 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500">
                            <Code2 size={14} />
                            TEKNOLOGI
                          </div>

                          <p className="mt-2 break-words text-sm leading-6 text-gray-700">
                            {project.technologies}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 pt-4">
                          {safeProjectLink ? (
                            <a
                              href={safeProjectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] transition-colors hover:text-blue-800"
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
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleEdit(project)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#0756A5]"
                            >
                              <Pencil size={15} />
                              Edit
                            </motion.button>

                            <motion.button
                              type="button"
                              disabled={deletingId === project.id}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleDelete(project.id)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                              {deletingId === project.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </motion.button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
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
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
          />
          <p className="mt-4 text-sm text-gray-500">Memuat proyek...</p>
        </div>
      </main>
    );
  }

  return <ProjectsManager key={user.id} userId={user.id} />;
}
