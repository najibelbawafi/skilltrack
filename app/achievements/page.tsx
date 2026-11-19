
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
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100";

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

    const allowedCategories = [
      "Kompetisi",
      "Akademik",
      "Organisasi",
      "Proyek",
      "Penghargaan",
      "Lainnya",
    ];

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

      <main className="min-h-screen">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#0756A5]">
                PORTOFOLIO SISWA
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#25364A] md:text-4xl">
                Pencapaian Saya
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Dokumentasikan prestasi, penghargaan, dan pencapaian yang telah
                kamu raih.
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="glass-button flex items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-800"
            >
              <Plus size={18} />
              Tambah Pencapaian
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {message && !showForm && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="glass-card mt-8 flex items-center gap-4 p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
              <Trophy size={26} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Pencapaian
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#25364A]">
                {achievements.length}
              </p>
            </div>

            <div className="ml-auto hidden text-[#0756A5]/20 sm:block">
              <Award size={46} strokeWidth={1.3} />
            </div>
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[#0756A5]">
                      DATA PENCAPAIAN
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[#25364A]">
                      {editingId ? "Edit Pencapaian" : "Tambah Pencapaian"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Tutup formulir"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
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
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Kategori *
                      </label>
                      <select
                        required
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className={inputClass}
                      >
                        <option value="Kompetisi">Kompetisi</option>
                        <option value="Akademik">Akademik</option>
                        <option value="Organisasi">Organisasi</option>
                        <option value="Proyek">Proyek</option>
                        <option value="Penghargaan">Penghargaan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Penyelenggara *
                      </label>
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
                      <label className="mb-2 block text-sm font-medium text-gray-700">
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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      rows={4}
                      maxLength={1500}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Jelaskan pencapaian atau pengalaman yang diperoleh..."
                      className={inputClass}
                    />
                    <p className="mt-2 text-right text-xs text-gray-400">
                      {description.length}/1500 karakter
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Foto Bukti Pencapaian
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-7 text-center transition hover:border-[#0756A5] hover:bg-blue-50">
                      <Upload size={28} className="text-[#0756A5]" />
                      <span className="mt-3 text-sm font-semibold text-gray-700">
                        Klik untuk upload foto
                      </span>
                      <span className="mt-1 text-xs text-gray-500">
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
                        <div className="mt-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={achievementImage}
                            alt="Pratinjau foto pencapaian"
                            className="h-56 w-full rounded-xl border border-gray-200 bg-gray-100 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setAchievementImage("")}
                            className="mt-2 text-sm font-medium text-red-600 hover:underline"
                          >
                            Hapus foto
                          </button>
                        </div>
                      )}
                  </div>

                  {message && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      {message}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Pencapaian"}
                    </motion.button>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#25364A]">
                  Daftar Pencapaian
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Semua pencapaian yang telah kamu dokumentasikan.
                </p>
              </div>
              <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm backdrop-blur-xl">
                {achievements.length} data
              </span>
            </div>

            {loadingAchievements ? (
              <div className="glass-card mt-5 px-6 py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-[#0756A5]" />
                <p className="mt-4 text-sm text-gray-500">
                  Memuat pencapaian dari Supabase...
                </p>
              </div>
            ) : achievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mt-5 px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-300">
                  <Trophy size={34} />
                </div>
                <h3 className="mt-5 font-bold text-[#25364A]">
                  Belum Ada Pencapaian
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Pencapaian yang kamu tambahkan akan ditampilkan di bagian
                  ini.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-5 text-sm font-semibold text-[#0756A5] hover:underline"
                >
                  Tambahkan pencapaian pertama
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="mt-5 grid gap-5 md:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {achievements.map((achievement, index) => (
                    <motion.article
                      layout
                      key={achievement.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.04, 0.2),
                      }}
                      className="glass-card overflow-hidden"
                    >
                      {achievement.imageDataUrl &&
                      isValidImageDataUrl(achievement.imageDataUrl) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={achievement.imageDataUrl}
                          alt={`Foto pencapaian ${achievement.title}`}
                          className="h-52 w-full border-b border-white/70 bg-gray-50 object-contain"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center border-b border-white/70 bg-gradient-to-br from-blue-50/90 to-white/70">
                          <ImagePlus
                            size={38}
                            className="text-[#0756A5]/35"
                          />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                              <Trophy size={21} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="break-words font-bold leading-6 text-[#25364A]">
                                {achievement.title}
                              </h3>
                              <p className="mt-1 break-words text-sm text-gray-500">
                                {achievement.organizer}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleEdit(achievement)}
                              className="rounded-xl p-2 text-gray-500 transition hover:bg-blue-50 hover:text-[#0756A5]"
                              aria-label="Edit pencapaian"
                            >
                              <Pencil size={17} />
                            </motion.button>

                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              disabled={deletingId === achievement.id}
                              onClick={() => handleDelete(achievement.id)}
                              className="rounded-xl p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label="Hapus pencapaian"
                            >
                              <Trash2 size={17} />
                            </motion.button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-[#0756A5]">
                            {achievement.category}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={16} className="shrink-0" />
                          {achievement.date}
                        </div>

                        {achievement.description && (
                          <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
                            {achievement.description}
                          </p>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
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
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-[#0756A5]" />
          <p className="mt-4 text-sm text-gray-500">
            Memuat pencapaian...
          </p>
        </div>
      </main>
    );
  }

  return <AchievementManager key={user.id} userId={user.id} />;
}
