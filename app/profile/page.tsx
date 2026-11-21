
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  User,
  Save,
  GraduationCap,
  FileText,
  CheckCircle2,
  X,
  Camera,
  LoaderCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
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
  duration: 0.4,
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

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

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

      reader.onerror = () => reject(new Error("Foto gagal dibaca."));

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
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
        <Icon size={21} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 pt-0.5">
        <h2 className="text-base font-bold text-[#25364A]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
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
  children: ReactNode;
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
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#25364A] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70";

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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [photoPreviewError, setPhotoPreviewError] = useState(false);

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

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
        if (mounted) setIsLoading(false);
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

    setMessage("");
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    input.value = "";

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setMessageType("error");
      setMessage("Format foto harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setMessageType("error");
      setMessage("Ukuran foto maksimal 2 MB.");
      return;
    }

    setIsUploadingPhoto(true);
    setMessage("");

    try {
      const compressedPhoto = await compressPhoto(file);

      setForm((previous) => ({
        ...previous,
        photoUrl: compressedPhoto,
      }));

      setPhotoPreviewError(false);

      setMessageType("success");
      setMessage(
        "Foto berhasil dipasang. Klik dua kali foto untuk menyesuaikan tampilannya."
      );
    } catch (error) {
      console.error("Gagal memproses foto:", error);

      setMessageType("error");
      setMessage("Foto gagal diproses. Silakan coba gambar lain.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function openCropEditor() {
    if (!form.photoUrl || photoPreviewError) return;

    setCropSource(form.photoUrl);
    setCropZoom(1);
    setCropX(50);
    setCropY(50);
    setIsCropOpen(true);
  }

  function closeCropEditor() {
    setIsCropOpen(false);
    setCropSource("");
  }

  function applyCrop() {
    const image = cropImageRef.current;

    if (!image || !image.naturalWidth || !image.naturalHeight) {
      setMessageType("error");
      setMessage("Gambar belum siap diproses.");
      return;
    }

    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const cropSize = size / cropZoom;

    const maxX = image.naturalWidth - cropSize;
    const maxY = image.naturalHeight - cropSize;

    const sourceX = (maxX * cropX) / 100;
    const sourceY = (maxY * cropY) / 100;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");

    if (!context) {
      setMessageType("error");
      setMessage("Gagal memproses bingkai foto.");
      return;
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      512,
      512
    );

    const croppedPhoto = canvas.toDataURL("image/webp", 0.85);

    setForm((previous) => ({
      ...previous,
      photoUrl: croppedPhoto,
    }));

    setPhotoPreviewError(false);
    setMessageType("success");
    setMessage(
      "Penyesuaian foto berhasil diterapkan. Simpan profil untuk menyimpan perubahan."
    );

    closeCropEditor();
  }

  function handleRemovePhoto() {
    setForm((previous) => ({
      ...previous,
      photoUrl: "",
    }));

    setPhotoPreviewError(false);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isUploadingPhoto) {
      setMessageType("error");
      setMessage("Tunggu sampai pemrosesan foto selesai.");
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
        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
            <LoaderCircle
              size={19}
              className="animate-spin text-[#0756A5]"
            />
            Memuat profil...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="mb-7"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#0756A5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0756A5]" />
              PENGATURAN PROFIL
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
              Profil Saya
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola informasi pribadi dan pendidikan untuk membangun profil
              digital yang profesional.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INFORMASI PRIBADI */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="mb-7 flex items-center gap-4">
                <div className="group relative h-16 w-16 shrink-0 sm:h-[76px] sm:w-[76px]">
                  <button
                    type="button"
                    onDoubleClick={openCropEditor}
                    onClick={() => {
                      if (!form.photoUrl) {
                        photoInputRef.current?.click();
                      }
                    }}
                    title="Klik dua kali untuk mengatur foto"
                    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-blue-50 text-[#0756A5] shadow-sm outline-none transition hover:border-[#0756A5] focus-visible:ring-4 focus-visible:ring-blue-100"
                  >
                    {hasPhoto ? (
                      <img
                        src={form.photoUrl}
                        alt="Foto profil"
                        onError={() => setPhotoPreviewError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={29} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    aria-label="Ganti foto profil"
                    title="Ganti foto profil"
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0756A5] text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
                  >
                    {isUploadingPhoto ? (
                      <LoaderCircle size={13} className="animate-spin" />
                    ) : (
                      <Camera size={13} />
                    )}
                  </button>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#25364A]">
                    Informasi Pribadi
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Informasi dasar tentang diri kamu.
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {isUploadingPhoto
                      ? "Memproses foto..."
                      : hasPhoto
                        ? "Klik dua kali foto untuk menyesuaikan bingkai."
                        : "Pilih foto melalui ikon kamera."}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
            </motion.section>

            {/* INFORMASI PENDIDIKAN */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
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
                    placeholder="Nama sekolah"
                    className={inputClass}
                  />
                </Field>

                <Field label="Jurusan">
                  <input
                    maxLength={100}
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    placeholder="Jurusan"
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
            </motion.section>

            {/* TENTANG SAYA */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.15 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
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
            </motion.section>

            {/* NOTIFIKASI */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  role="status"
                  className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    messageType === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  ) : (
                    <X size={19} className="mt-0.5 shrink-0" />
                  )}

                  <p>{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SIMPAN PROFIL */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-4">
              <p className="hidden text-xs text-slate-500 sm:block">
                Pastikan informasi profil sudah benar.
              </p>

              <button
                type="submit"
                disabled={isSaving || isUploadingPhoto}
                className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {isSaving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* EDITOR FOTO PROFIL */}
      <AnimatePresence>
        {isCropOpen && cropSource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCropEditor();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="crop-title"
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2
                    id="crop-title"
                    className="font-bold text-[#25364A]"
                  >
                    Sesuaikan Foto Profil
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Atur gambar agar sesuai dengan bingkai.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCropEditor}
                  aria-label="Tutup editor"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="p-5">
                <div className="mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-full border-4 border-slate-200 bg-slate-100 shadow-inner">
                  <img
                    ref={cropImageRef}
                    src={cropSource}
                    alt="Pratinjau penyesuaian foto"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                    style={{
                      objectPosition: `${cropX}% ${cropY}%`,
                      transform: `scale(${cropZoom})`,
                    }}
                  />
                </div>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Pratinjau berbentuk lingkaran. Hasil akan dipotong menjadi
                  gambar persegi yang sesuai dengan bingkai profil.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Perbesar / perkecil
                      </label>
                      <span className="text-xs font-medium text-slate-500">
                        {cropZoom.toFixed(1)}x
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <ZoomOut size={17} className="shrink-0 text-slate-400" />
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={cropZoom}
                        onChange={(e) =>
                          setCropZoom(Number(e.target.value))
                        }
                        className="w-full accent-[#0756A5]"
                      />
                      <ZoomIn size={17} className="shrink-0 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Posisi horizontal
                      </label>
                      <span className="text-xs text-slate-400">
                        {Math.round(cropX)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropX}
                      onChange={(e) => setCropX(Number(e.target.value))}
                      className="w-full accent-[#0756A5]"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Posisi vertikal
                      </label>
                      <span className="text-xs text-slate-400">
                        {Math.round(cropY)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cropY}
                      onChange={(e) => setCropY(Number(e.target.value))}
                      className="w-full accent-[#0756A5]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCropZoom(1);
                      setCropX(50);
                      setCropY(50);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <RotateCcw size={16} />
                    Atur Ulang
                  </button>

                  <button
                    type="button"
                    onClick={closeCropEditor}
                    className="ml-auto min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={applyCrop}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    <Check size={16} />
                    Terapkan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          <LoaderCircle
            size={19}
            className="animate-spin text-[#0756A5]"
          />
          Memuat profil...
        </div>
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
