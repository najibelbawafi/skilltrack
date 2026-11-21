
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  X,
  ImagePlus,
  Upload,
  Award,
  Building2,
  Tag,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";
import type { StudentAchievement } from "@/lib/achievements";

type AchievementRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  description: string;
  image_url: string | null;
  created_at: string;
};

const transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

const allowedCategories = [
  "Kompetisi",
  "Akademik",
  "Organisasi",
  "Proyek",
  "Penghargaan",
  "Lainnya",
];

function mapAchievement(row: AchievementRow): StudentAchievement {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    organizer: row.organizer,
    date: row.date,
    description: row.description,
    imageDataUrl: row.image_url ?? "",
    createdAt: row.created_at,
  };
}

function isValidImageDataUrl(value: string) {
  return /^data:image\/(jpeg|png|webp);base64,/i.test(value);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function formatAchievementDate(value: string) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function AchievementManager({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kompetisi");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [achievementImage, setAchievementImage] = useState("");
  const [message, setMessage] = useState("");

  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  useEffect(() => {
    let active = true;

    async function loadAchievements() {
      setLoadingAchievements(true);
      setMessage("");

      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Gagal memuat pencapaian:", error);
        setMessage("Gagal memuat pencapaian. Silakan coba kembali.");
        setLoadingAchievements(false);
        return;
      }

      const rows = (data ?? []) as AchievementRow[];

      setAchievements(rows.map(mapAchievement));
      setLoadingAchievements(false);
    }

    loadAchievements();

    return () => {
      active = false;
    };
  }, [userId]);

  function resetForm() {
    setTitle("");
    setCategory("Kompetisi");
    setOrganizer("");
    setDate("");
    setDescription("");
    setAchievementImage("");
    setEditingId(null);
    setShowForm(false);
    setMessage("");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      window.alert("Gunakan foto JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Ukuran foto maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result === "string" &&
        isValidImageDataUrl(reader.result)
      ) {
        setAchievementImage(reader.result);
        setMessage("");
      } else {
        window.alert("Format gambar tidak valid.");
      }
    };

    reader.onerror = () => {
      window.alert("Gagal membaca foto. Silakan coba lagi.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setMessage("");

    const cleanTitle = title.trim();
    const cleanOrganizer = organizer.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanOrganizer || !date || !category) {
      setMessage(
        "Nama pencapaian, kategori, penyelenggara, dan tanggal wajib diisi."
      );
      return;
    }

    if (cleanTitle.length > 150) {
      setMessage("Nama pencapaian maksimal 150 karakter.");
      return;
    }

    if (cleanOrganizer.length > 150) {
      setMessage("Nama penyelenggara maksimal 150 karakter.");
      return;
    }

    if (cleanDescription.length > 1500) {
      setMessage("Deskripsi maksimal 1.500 karakter.");
      return;
    }

    if (!allowedCategories.includes(category)) {
      setMessage("Kategori pencapaian tidak valid.");
      return;
    }

    if (!isValidDate(date)) {
      setMessage("Tanggal pencapaian tidak valid.");
      return;
    }

    if (date > new Date().toISOString().split("T")[0]) {
      setMessage("Tanggal pencapaian tidak boleh di masa depan.");
      return;
    }

    if (achievementImage && !isValidImageDataUrl(achievementImage)) {
      setMessage("Data gambar tidak valid. Silakan upload ulang.");
      return;
    }

    const existingAchievement = editingId
      ? achievements.find((item) => item.id === editingId)
      : null;

    if (editingId && !existingAchievement) {
      setMessage("Data pencapaian tidak ditemukan.");
      return;
    }

    const achievementData = {
      user_id: userId,
      title: cleanTitle,
      category,
      organizer: cleanOrganizer,
      date,
      description: cleanDescription,
      image_url: achievementImage || null,
    };

    setSaving(true);

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("achievements")
          .update(achievementData)
          .eq("id", editingId)
          .eq("user_id", userId)
          .select("*")
          .single();

        if (error) throw error;

        const updatedAchievement = mapAchievement(data as AchievementRow);

        setAchievements((previous) =>
          previous.map((item) =>
            item.id === editingId ? updatedAchievement : item
          )
        );
      } else {
        const { data, error } = await supabase
          .from("achievements")
          .insert(achievementData)
          .select("*")
          .single();

        if (error) throw error;

        const newAchievement = mapAchievement(data as AchievementRow);

        setAchievements((previous) => [newAchievement, ...previous]);
      }

      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan pencapaian:", error);
      setMessage(
        "Penyimpanan gagal. Periksa koneksi dan konfigurasi Supabase."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(achievement: StudentAchievement) {
    if (achievement.userId !== userId) return;

    setEditingId(achievement.id);
    setTitle(achievement.title);
    setCategory(achievement.category);
    setOrganizer(achievement.organizer);
    setDate(achievement.date);
    setDescription(achievement.description);
    setAchievementImage(
      achievement.imageDataUrl &&
        isValidImageDataUrl(achievement.imageDataUrl)
        ? achievement.imageDataUrl
        : ""
    );
    setMessage("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus pencapaian ini?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      const { error } = await supabase
        .from("achievements")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setAchievements((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Gagal menghapus pencapaian:", error);
      setMessage("Gagal menghapus pencapaian. Silakan coba kembali.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F7F9FC]">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0756A5]">
                <Trophy size={17} />
                Portofolio Siswa
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Pencapaian Saya
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Dokumentasikan prestasi, penghargaan, dan pencapaian yang telah
                kamu raih.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
            >
              <Plus size={18} />
              Tambah Pencapaian
            </button>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.05 }}
            className="mt-7 flex max-w-xs items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
              <Trophy size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Pencapaian</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                {achievements.length}
              </p>
            </div>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {message && !showForm && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.section
                key="achievement-form"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={transition}
                className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 md:px-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0756A5]">
                      Data Pencapaian
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {editingId ? "Edit Pencapaian" : "Tambah Pencapaian"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Lengkapi informasi pencapaian yang ingin ditampilkan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Tutup formulir"
                  >
                    <X size={19} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-7">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Nama Pencapaian *
                      </label>

                      <input
                        required
                        maxLength={150}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Contoh: Juara 1 Kompetisi Robotik"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Kategori *</label>

                      <select
                        required
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className={inputClass}
                      >
                        {allowedCategories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Penyelenggara *</label>

                      <input
                        required
                        maxLength={150}
                        value={organizer}
                        onChange={(event) => setOrganizer(event.target.value)}
                        placeholder="Contoh: Dinas Pendidikan"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Tanggal Pencapaian *
                      </label>

                      <input
                        required
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className={labelClass}>Deskripsi</label>

                    <textarea
                      rows={4}
                      maxLength={1500}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Jelaskan pencapaian atau pengalaman yang diperoleh..."
                      className={`${inputClass} resize-y leading-6`}
                    />

                    <p className="mt-2 text-right text-xs text-slate-400">
                      {description.length}/1500 karakter
                    </p>
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className={labelClass}>
                      Foto Bukti Pencapaian
                    </label>

                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-[#0756A5] hover:bg-blue-50/50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0756A5] shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
                        <Upload size={21} />
                      </div>

                      <span className="mt-3 text-sm font-semibold text-slate-700">
                        Klik untuk upload foto
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, atau WEBP · Maksimal 2 MB
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {achievementImage &&
                      isValidImageDataUrl(achievementImage) && (
                        <div className="mt-4 rounded-xl border border-slate-200 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Pratinjau Foto
                            </p>

                            <button
                              type="button"
                              onClick={() => setAchievementImage("")}
                              className="text-sm font-medium text-red-600 transition hover:text-red-700"
                            >
                              Hapus foto
                            </button>
                          </div>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={achievementImage}
                            alt="Pratinjau foto pencapaian"
                            className="h-56 w-full rounded-lg bg-slate-50 object-contain"
                          />
                        </div>
                      )}
                  </div>

                  {/* Form error */}
                  {message && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {message}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Pencapaian"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Achievement list */}
          <section className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Daftar Pencapaian
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Semua pencapaian yang telah kamu dokumentasikan.
                </p>
              </div>

              <span className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                {achievements.length} data
              </span>
            </div>

            {loadingAchievements ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Memuat pencapaian dari Supabase...
                </p>
              </div>
            ) : achievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <Trophy size={29} />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Belum Ada Pencapaian
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Pencapaian yang kamu tambahkan akan ditampilkan di bagian ini.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] transition hover:text-blue-800"
                >
                  <Plus size={17} />
                  Tambahkan Pencapaian Pertama
                </button>
              </motion.div>
            ) : (
              <motion.div layout className="grid gap-5 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {achievements.map((achievement, index) => (
                    <motion.article
                      layout
                      key={achievement.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{
                        ...transition,
                        delay: Math.min(index * 0.04, 0.16),
                      }}
                      whileHover={{ y: -3 }}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Image */}
                      {achievement.imageDataUrl &&
                      isValidImageDataUrl(achievement.imageDataUrl) ? (
                        <div className="flex h-52 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50 p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={achievement.imageDataUrl}
                            alt={`Foto pencapaian ${achievement.title}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center border-b border-slate-100 bg-slate-50">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0756A5] shadow-sm ring-1 ring-slate-200">
                            <ImagePlus size={27} />
                          </div>
                        </div>
                      )}

                      <div className="p-5 md:p-6">
                        {/* Title and actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                              <Award size={21} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="break-words font-bold leading-6 text-slate-900">
                                {achievement.title}
                              </h3>

                              <p className="mt-1 flex items-start gap-1.5 break-words text-sm text-slate-500">
                                <Building2
                                  size={14}
                                  className="mt-0.5 shrink-0"
                                />
                                {achievement.organizer}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(achievement)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#0756A5]"
                              aria-label="Edit pencapaian"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === achievement.id}
                              onClick={() => handleDelete(achievement.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label="Hapus pencapaian"
                            >
                              {deletingId === achievement.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="mt-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0756A5]">
                            <Tag size={12} />
                            {achievement.category}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-[#0756A5]"
                          />

                          <span>
                            {formatAchievementDate(achievement.date)}
                          </span>
                        </div>

                        {/* Description */}
                        {achievement.description && (
                          <p className="mt-4 whitespace-pre-wrap break-words border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                            {achievement.description}
                          </p>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
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

          <p className="mt-4 text-sm text-slate-500">
            Memuat pencapaian...
          </p>
        </div>
      </main>
    );
  }

  return <AchievementManager key={user.id} userId={user.id} />;
}
