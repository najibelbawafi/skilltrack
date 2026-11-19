
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  X,
  ImagePlus,
  Upload,
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
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100";

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

        const updatedAchievement = mapAchievement(
          data as AchievementRow
        );

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

      <main className="min-h-screen bg-[#F4F7FB]">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#0756A5]">
                PORTOFOLIO SISWA
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#25364A] md:text-3xl">
                Pencapaian Saya
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Dokumentasikan prestasi, penghargaan, dan pencapaianmu.
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
              Tambah Pencapaian
            </button>
          </div>

          {message && !showForm && (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {message}
            </p>
          )}

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                <Trophy size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Pencapaian</p>
                <p className="text-2xl font-bold text-[#25364A]">
                  {achievements.length}
                </p>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#25364A]">
                  {editingId ? "Edit Pencapaian" : "Tambah Pencapaian"}
                </h2>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-[#0756A5] hover:bg-blue-50">
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
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    {message}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#25364A]">
              Daftar Pencapaian
            </h2>

            {loadingAchievements ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <p className="text-sm text-gray-500">
                  Memuat pencapaian dari Supabase...
                </p>
              </div>
            ) : achievements.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <Trophy className="mx-auto text-gray-300" size={42} />

                <h3 className="mt-4 font-semibold text-[#25364A]">
                  Belum Ada Pencapaian
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Pencapaian yang kamu tambahkan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <article
                    key={achievement.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    {achievement.imageDataUrl &&
                    isValidImageDataUrl(achievement.imageDataUrl) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={achievement.imageDataUrl}
                        alt={`Foto pencapaian ${achievement.title}`}
                        className="h-52 w-full border-b border-gray-200 bg-gray-100 object-contain"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center border-b border-gray-200 bg-blue-50">
                        <ImagePlus size={38} className="text-blue-300" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                            <Trophy size={22} />
                          </div>

                          <div>
                            <h3 className="font-bold text-[#25364A]">
                              {achievement.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {achievement.organizer}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(achievement)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-[#0756A5]"
                            aria-label="Edit pencapaian"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === achievement.id}
                            onClick={() => handleDelete(achievement.id)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label="Hapus pencapaian"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0756A5]">
                          {achievement.category}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={16} />
                        {achievement.date}
                      </div>

                      {achievement.description && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                          {achievement.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
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
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat pencapaian...</p>
      </main>
    );
  }

  return <AchievementManager key={user.id} userId={user.id} />;
}
