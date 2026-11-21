
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
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
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
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#25364A] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70";

function getSafeExternalUrl(value: string): string | null {
  if (!value.trim()) return null;

  try {
    const url = new URL(value.trim());

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
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoadingProjects(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!active) return;

        const rows = (data ?? []) as ProjectRow[];
        setProjects(rows.map(mapProject));
      } catch (error) {
        console.error("Gagal memuat proyek:", error);

        if (active) {
          setErrorMessage(
            "Gagal memuat proyek. Periksa koneksi dan coba kembali."
          );
        }
      } finally {
        if (active) {
          setLoadingProjects(false);
        }
      }
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

  function openNewForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedLink = form.link.trim();

    if (trimmedLink && !getSafeExternalUrl(trimmedLink)) {
      setErrorMessage(
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

    if (
      !projectData.title ||
      !projectData.category ||
      !projectData.description ||
      !projectData.technologies ||
      !projectData.year
    ) {
      setErrorMessage("Lengkapi seluruh informasi proyek terlebih dahulu.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

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

        setSuccessMessage("Proyek berhasil diperbarui.");
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(projectData)
          .select("*")
          .single();

        if (error) throw error;

        const newProject = mapProject(data as ProjectRow);

        setProjects((previous) => [newProject, ...previous]);

        setSuccessMessage("Proyek berhasil ditambahkan.");
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
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(projectId: string) {
    if (deletingId) return;

    if (!window.confirm("Yakin ingin menghapus proyek ini?")) return;

    setDeletingId(projectId);
    setErrorMessage("");
    setSuccessMessage("");

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

      setSuccessMessage("Proyek berhasil dihapus.");
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

      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#0756A5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0756A5]" />
                PORTOFOLIO SISWA
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
                Proyek Saya
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Kelola dan dokumentasikan proyek yang pernah kamu kerjakan
                dalam satu tempat.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewForm}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
            >
              <Plus size={18} />
              Tambah Proyek
            </button>
          </motion.section>

          {/* NOTIFIKASI */}
          <AnimatePresence>
            {(errorMessage || successMessage) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                role={errorMessage ? "alert" : "status"}
                className={`mb-5 flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 text-sm ${
                  errorMessage
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {errorMessage ? (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                )}

                <p>{errorMessage || successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM */}
          <AnimatePresence>
            {showForm && (
              <motion.section
                key="project-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={transition}
                className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#0756A5]">
                      {editingId ? "PERBARUI DATA" : "PROYEK BARU"}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#25364A]">
                      {editingId ? "Edit Proyek" : "Tambah Proyek Baru"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Lengkapi informasi proyek yang ingin ditampilkan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    aria-label="Tutup formulir"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    <X size={19} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="project-title"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Nama Proyek *
                    </label>

                    <input
                      id="project-title"
                      required
                      maxLength={150}
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="Contoh: Smart Feeder IoT"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="project-category"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Kategori *
                      </label>

                      <select
                        id="project-category"
                        required
                        value={form.category}
                        onChange={(event) =>
                          updateField("category", event.target.value)
                        }
                        className={inputClass}
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
                      <label
                        htmlFor="project-year"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Tahun Pengerjaan *
                      </label>

                      <input
                        id="project-year"
                        required
                        type="number"
                        min="2000"
                        max="2100"
                        value={form.year}
                        onChange={(event) =>
                          updateField("year", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="project-description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Deskripsi Proyek *
                    </label>

                    <textarea
                      id="project-description"
                      required
                      rows={4}
                      maxLength={3000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="Jelaskan tujuan, cara kerja, dan hasil proyek..."
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-technologies"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Teknologi yang Digunakan *
                    </label>

                    <input
                      id="project-technologies"
                      required
                      maxLength={500}
                      value={form.technologies}
                      onChange={(event) =>
                        updateField("technologies", event.target.value)
                      }
                      placeholder="Contoh: ESP32, Arduino IDE, C++"
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Pisahkan beberapa teknologi menggunakan koma.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="project-link"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Link Proyek
                      <span className="ml-2 font-normal text-slate-400">
                        (Opsional)
                      </span>
                    </label>

                    <input
                      id="project-link"
                      type="url"
                      value={form.link}
                      onChange={(event) =>
                        updateField("link", event.target.value)
                      }
                      placeholder="https://github.com/username/project"
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Gunakan alamat yang diawali https:// atau http://.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Proyek"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={resetForm}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* DAFTAR PROYEK */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#25364A]">
                  Daftar Proyek
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Semua proyek yang sudah kamu dokumentasikan.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0756A5]">
                <FolderKanban size={15} />
                {projects.length} Proyek
              </div>
            </div>

            {loadingProjects ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16">
                <LoaderCircle
                  size={27}
                  className="animate-spin text-[#0756A5]"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Memuat proyek...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <FolderKanban size={28} strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 font-bold text-[#25364A]">
                  Belum Ada Proyek
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Tambahkan proyek yang pernah kamu kerjakan untuk membangun
                  portofolio digital.
                </p>

                <button
                  type="button"
                  onClick={openNewForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  <Plus size={17} />
                  Tambah Proyek Pertama
                </button>
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
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          ...transition,
                          delay: Math.min(index * 0.04, 0.16),
                        }}
                        whileHover={{ y: -3 }}
                        className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="inline-flex max-w-full rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0756A5]">
                              {project.category}
                            </span>

                            <h3 className="mt-4 break-words text-lg font-bold leading-snug text-[#25364A]">
                              {project.title}
                            </h3>

                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                              <CalendarDays size={14} />
                              Tahun {project.year}
                            </div>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                            <FolderKanban size={21} />
                          </div>
                        </div>

                        <p className="mt-5 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                          {project.description}
                        </p>

                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
                            <Code2 size={15} />
                            TEKNOLOGI
                          </div>

                          <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                            {project.technologies}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          {safeProjectLink ? (
                            <a
                              href={safeProjectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] transition hover:text-blue-800"
                            >
                              Lihat Proyek
                              <ExternalLink size={15} />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {project.link
                                ? "Link tidak valid"
                                : "Tidak ada link"}
                            </span>
                          )}

                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => handleEdit(project)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#0756A5]"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === project.id}
                              onClick={() => handleDelete(project.id)}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === project.id ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={15} />
                              )}

                              {deletingId === project.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </button>
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
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          <LoaderCircle
            size={19}
            className="animate-spin text-[#0756A5]"
          />
          Memuat proyek...
        </div>
      </main>
    );
  }

  return <ProjectsManager key={user.id} userId={user.id} />;
}
