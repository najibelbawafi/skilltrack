
"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  User,
  Save,
  GraduationCap,
  FileText,
  CheckCircle2,
  Upload,
  X,
  Camera,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth, type AuthUser } from "@/app/providers";
import type { StudentProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSafePhotoUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  if (/^data:image\/(jpeg|png|webp);base64,/i.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

async function compressPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);

  try {
    const maxDimension = 512;

    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas tidak tersedia.");
    }

    context.drawImage(
      bitmap,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Foto gagal dikompres."));
          }
        },
        "image/webp",
        0.75
      );
    });

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Foto gagal dibaca."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Foto gagal dibaca."));
      };

      reader.readAsDataURL(blob);
    });
  } finally {
    bitmap.close();
  }
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
        <Icon size={21} />
      </div>

      <div className="min-w-0">
        <h2 className="font-bold text-[#25364A]">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#25364A] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70";

function ProfileForm({
  userId,
  user,
}: {
  userId: string;
  user: AuthUser;
}) {
  const [form, setForm] = useState<StudentProfile>({
    userId,
    fullName: user.name,
    email: user.email,
    phone: "",
    birthPlace: "",
    birthDate: "",
    gender: "",
    address: "",
    bio: "",
    major: "SIJA",
    school: "SMK TI Bazma",
    startYear: "",
    graduationYear: "",
    photoUrl: "",
    updatedAt: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const hasPhoto = Boolean(form.photoUrl && !photoPreviewError);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;

        if (!mounted) return;

        if (data) {
          setForm({
            userId,
            fullName: data.full_name ?? user.name,
            email: user.email,
            phone: data.phone ?? "",
            birthPlace: data.birth_place ?? "",
            birthDate: data.birth_date ?? "",
            gender: data.gender ?? "",
            address: data.address ?? "",
            bio: data.bio ?? "",
            major: data.major ?? "",
            school: data.school ?? "",
            startYear: data.start_year ?? "",
            graduationYear: data.graduation_year ?? "",
            photoUrl: data.photo_url ?? "",
            updatedAt: data.updated_at ?? "",
          });
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);

        if (mounted) {
          setMessageType("error");
          setMessage("Data profil gagal dimuat dari server.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [userId, user.name, user.email]);

  function updateField(field: keyof StudentProfile, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (field === "photoUrl") {
      setPhotoPreviewError(false);
    }

    setMessage("");
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setMessageType("error");
      setMessage("Format foto harus JPG, PNG, atau WebP.");
      setSelectedPhoto(null);
      input.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setMessageType("error");
      setMessage("Ukuran foto maksimal 2 MB.");
      setSelectedPhoto(null);
      input.value = "";
      return;
    }

    setSelectedPhoto(file);
    setMessageType("success");
    setMessage("Foto dipilih. Klik Unggah Foto untuk memasangnya.");

    input.value = "";
  }

  async function handleUploadPhoto() {
    if (!selectedPhoto || isUploadingPhoto) return;

    setIsUploadingPhoto(true);

    try {
      const compressedPhoto = await compressPhoto(selectedPhoto);

      setForm((previous) => ({
        ...previous,
        photoUrl: compressedPhoto,
      }));

      setSelectedPhoto(null);
      setPhotoPreviewError(false);

      setMessageType("success");
      setMessage(
        "Foto berhasil dipasang. Klik Simpan Profil untuk menyimpan perubahan."
      );
    } catch (error) {
      console.error("Gagal memproses foto:", error);

      setMessageType("error");
      setMessage("Foto gagal diproses. Silakan coba gambar lain.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleRemovePhoto() {
    setForm((previous) => ({
      ...previous,
      photoUrl: "",
    }));

    setSelectedPhoto(null);
    setPhotoPreviewError(false);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (selectedPhoto) {
      setMessageType("error");
      setMessage("Klik Unggah Foto terlebih dahulu sebelum menyimpan profil.");
      return;
    }

    if (!userId || user.id !== userId) {
      setMessageType("error");
      setMessage("Sesi akun tidak valid. Silakan login kembali.");
      return;
    }

    const fullName = form.fullName.trim();
    const email = user.email.trim();
    const photoUrl = getSafePhotoUrl(form.photoUrl);

    if (!fullName || !email) {
      setMessageType("error");
      setMessage("Nama lengkap dan email wajib diisi.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessageType("error");
      setMessage("Format email akun tidak valid.");
      return;
    }

    if (photoUrl === null) {
      setMessageType("error");
      setMessage("Foto harus berupa gambar yang valid atau URL HTTP/HTTPS.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const startYear = form.startYear.trim();
    const graduationYear = form.graduationYear.trim();

    if (startYear) {
      const year = Number(startYear);

      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > currentYear + 10
      ) {
        setMessageType("error");
        setMessage("Tahun masuk tidak valid.");
        return;
      }
    }

    if (graduationYear) {
      const year = Number(graduationYear);

      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > currentYear + 10
      ) {
        setMessageType("error");
        setMessage("Tahun lulus tidak valid.");
        return;
      }
    }

    if (
      startYear &&
      graduationYear &&
      Number(graduationYear) < Number(startYear)
    ) {
      setMessageType("error");
      setMessage("Tahun lulus tidak boleh lebih awal dari tahun masuk.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedAt = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName,
            phone: form.phone.trim(),
            birth_place: form.birthPlace.trim(),
            birth_date: form.birthDate || null,
            gender: form.gender,
            address: form.address.trim(),
            bio: form.bio.trim(),
            major: form.major.trim(),
            school: form.school.trim(),
            start_year: startYear,
            graduation_year: graduationYear,
            photo_url: photoUrl,
            updated_at: updatedAt,
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;

      setForm((previous) => ({
        ...previous,
        userId,
        fullName,
        email,
        photoUrl,
        updatedAt,
      }));

      setMessageType("success");
      setMessage("Profil berhasil disimpan ke Supabase.");
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      setMessageType("error");
      setMessage(
        "Profil gagal disimpan. Periksa koneksi dan konfigurasi Supabase."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader />
        <main className="flex min-h-[70vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-500"
          >
            <LoaderCircle size={18} className="animate-spin text-[#0756A5]" />
            Memuat profil...
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader />

      <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-[600px] h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          {/* PAGE INTRO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mb-8"
          >
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-[#0756A5]"
            >
              <ArrowLeft size={17} />
              Kembali ke Dashboard
            </Link>

            <div className="glass relative overflow-hidden rounded-[26px] p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0756A5] text-white shadow-lg shadow-blue-900/15">
                  <User size={26} />
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#0756A5]">
                    PERSONAL WORKSPACE
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
                    Profil Saya
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Lengkapi informasi diri dan pendidikan untuk membangun
                    profil digital yang profesional.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PERSONAL INFORMATION */}
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.08 }}
              className="glass-card p-5 sm:p-7"
            >
              <div className="relative z-10">
                <SectionHeading
                  icon={User}
                  title="Informasi Pribadi"
                  description="Informasi dasar tentang diri kamu."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* PROFILE PHOTO */}
                  <div className="sm:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Foto Profil
                    </label>

                    <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 sm:flex-row sm:items-center">
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-50 text-[#0756A5] shadow-md"
                      >
                        {hasPhoto ? (
                          <Image
                            src={form.photoUrl}
                            alt="Foto profil"
                            width={96}
                            height={96}
                            unoptimized
                            onError={() => setPhotoPreviewError(true)}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={34} />
                        )}

                        <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0756A5] text-white">
                          <Camera size={13} />
                        </div>
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#25364A]">
                          {hasPhoto ? "Foto profil kamu" : "Tambahkan foto profil"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          JPG, PNG, atau WebP. Ukuran maksimal 2 MB.
                        </p>

                        {selectedPhoto && (
                          <p className="mt-2 break-all text-xs font-medium text-[#0756A5]">
                            File dipilih: {selectedPhoto.name}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              if (selectedPhoto) {
                                void handleUploadPhoto();
                              } else {
                                photoInputRef.current?.click();
                              }
                            }}
                            disabled={isUploadingPhoto}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0756A5] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-blue-800 disabled:opacity-60"
                          >
                            {isUploadingPhoto ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : (
                              <Upload size={16} />
                            )}

                            {isUploadingPhoto
                              ? "Memproses..."
                              : selectedPhoto
                                ? "Unggah Foto"
                                : hasPhoto
                                  ? "Ganti Foto"
                                  : "Pilih Foto"}
                          </motion.button>

                          {hasPhoto && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={handleRemovePhoto}
                              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <X size={16} />
                              Hapus Foto
                            </motion.button>
                          )}
                        </div>

                        <input
                          ref={photoInputRef}
                          id="profilePhoto"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />

                        {photoPreviewError && (
                          <p className="mt-3 text-xs text-red-600">
                            Foto tidak dapat ditampilkan. Silakan unggah foto baru.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Field label="Nama Lengkap *">
                    <input
                      required
                      maxLength={100}
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email Akun">
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Ubah email melalui halaman Pengaturan Akun.
                    </p>
                  </Field>

                  <Field label="Nomor Telepon">
                    <input
                      type="tel"
                      maxLength={20}
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jenis Kelamin">
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </Field>

                  <Field label="Tempat Lahir">
                    <input
                      maxLength={100}
                      value={form.birthPlace}
                      onChange={(e) => updateField("birthPlace", e.target.value)}
                      placeholder="Kota kelahiran"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tanggal Lahir">
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => updateField("birthDate", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Alamat" className="sm:col-span-2">
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Masukkan alamat"
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                </div>
              </div>
            </motion.section>

            {/* EDUCATION */}
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.15 }}
              className="glass-card p-5 sm:p-7"
            >
              <div className="relative z-10">
                <SectionHeading
                  icon={GraduationCap}
                  title="Informasi Pendidikan"
                  description="Riwayat pendidikan saat ini."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Asal Sekolah">
                    <input
                      maxLength={150}
                      value={form.school}
                      onChange={(e) => updateField("school", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jurusan">
                    <input
                      maxLength={100}
                      value={form.major}
                      onChange={(e) => updateField("major", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tahun Masuk">
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      value={form.startYear}
                      onChange={(e) => updateField("startYear", e.target.value)}
                      placeholder="2024"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tahun Lulus">
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      value={form.graduationYear}
                      onChange={(e) =>
                        updateField("graduationYear", e.target.value)
                      }
                      placeholder="2027"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </motion.section>

            {/* BIO */}
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.22 }}
              className="glass-card p-5 sm:p-7"
            >
              <div className="relative z-10">
                <SectionHeading
                  icon={FileText}
                  title="Tentang Saya"
                  description="Ceritakan minat, kemampuan, dan tujuan kamu."
                />

                <textarea
                  rows={5}
                  maxLength={1500}
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tuliskan deskripsi singkat tentang diri kamu..."
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {form.bio.length}/1500 karakter
                </p>
              </div>
            </motion.section>

            {/* FEEDBACK */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.22 }}
                  role="status"
                  className={`flex items-start gap-3 overflow-hidden rounded-2xl border p-4 text-sm ${
                    messageType === "success"
                      ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
                      : "border-red-200 bg-red-50/90 text-red-700"
                  }`}
                >
                  {messageType === "success" && (
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  )}

                  {messageType === "error" && (
                    <X size={19} className="mt-0.5 shrink-0" />
                  )}

                  <p>{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SAVE BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.28 }}
              className="glass sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl p-3 shadow-xl shadow-slate-900/5 sm:p-4"
            >
              <p className="hidden text-xs text-slate-500 sm:block">
                Pastikan informasi profil sudah benar.
              </p>

              <motion.button
                type="submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSaving || isUploadingPhoto}
                className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {isSaving ? "Menyimpan..." : "Simpan Profil"}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </main>
    </>
  );
}

export default function ProfilePage() {
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-500"
        >
          <LoaderCircle size={18} className="animate-spin text-[#0756A5]" />
          Memuat profil...
        </motion.div>
      </main>
    );
  }

  return (
    <ProfileForm
      key={user.id}
      userId={user.id}
      user={user}
    />
  );
}
