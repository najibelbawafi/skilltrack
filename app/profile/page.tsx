
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  GraduationCap,
  FileText,
  CheckCircle2,
  Upload,
  X,
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
    if (!selectedPhoto) return;

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
        <main className="flex min-h-[70vh] items-center justify-center bg-[#F4F7FB]">
          <p className="text-sm text-slate-500">
            Memuat profil...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#25364A]">
              Profil Saya
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Lengkapi informasi diri dan pendidikan untuk membangun
              profil digital kamu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-50 text-[#0756A5]">
                  {hasPhoto ? (
                    <Image
                      src={form.photoUrl}
                      alt="Foto profil"
                      width={48}
                      height={48}
                      unoptimized
                      onError={() => setPhotoPreviewError(true)}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={21} />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-[#25364A]">
                    Informasi Pribadi
                  </h2>

                  <p className="text-sm text-slate-500">
                    Informasi dasar tentang diri kamu.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Foto Profil
                  </label>

                  <div className="flex flex-col gap-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    {hasPhoto ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedPhoto) {
                              void handleUploadPhoto();
                            } else {
                              photoInputRef.current?.click();
                            }
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0756A5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                          <Upload size={17} />
                          {selectedPhoto ? "Unggah Foto" : "Ganti Foto"}
                        </button>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <X size={17} />
                          Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="font-semibold text-[#25364A]">
                          Unggah Foto
                        </p>

                        <p className="text-sm text-slate-500">
                          Pilih foto dari perangkat kamu.
                        </p>

                        <p className="text-xs text-slate-400">
                          JPG, PNG, atau WebP. Maksimal 2 MB.
                        </p>

                        {selectedPhoto && (
                          <p className="text-sm font-medium text-[#0756A5]">
                            File dipilih: {selectedPhoto.name}
                          </p>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedPhoto) {
                                void handleUploadPhoto();
                              } else {
                                photoInputRef.current?.click();
                              }
                            }}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0756A5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                          >
                            <Upload size={17} />
                            {selectedPhoto ? "Unggah Foto" : "Pilih Foto"}
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={photoInputRef}
                      id="profilePhoto"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  {photoPreviewError && (
                    <p className="mt-3 text-xs text-red-600">
                      Foto tidak dapat ditampilkan. Silakan unggah foto baru.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nama Lengkap *
                  </label>

                  <input
                    required
                    maxLength={100}
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Akun
                  </label>

                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Ubah email melalui halaman Pengaturan Akun.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nomor Telepon
                  </label>

                  <input
                    type="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Jenis Kelamin
                  </label>

                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tempat Lahir
                  </label>

                  <input
                    maxLength={100}
                    value={form.birthPlace}
                    onChange={(e) => updateField("birthPlace", e.target.value)}
                    placeholder="Kota kelahiran"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tanggal Lahir
                  </label>

                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Alamat
                  </label>

                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Masukkan alamat"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                  <GraduationCap size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#25364A]">
                    Informasi Pendidikan
                  </h2>

                  <p className="text-sm text-slate-500">
                    Riwayat pendidikan saat ini.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Asal Sekolah
                  </label>

                  <input
                    maxLength={150}
                    value={form.school}
                    onChange={(e) => updateField("school", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Jurusan
                  </label>

                  <input
                    maxLength={100}
                    value={form.major}
                    onChange={(e) => updateField("major", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tahun Masuk
                  </label>

                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={form.startYear}
                    onChange={(e) => updateField("startYear", e.target.value)}
                    placeholder="2024"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tahun Lulus
                  </label>

                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={form.graduationYear}
                    onChange={(e) =>
                      updateField("graduationYear", e.target.value)
                    }
                    placeholder="2027"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#25364A]">
                    Tentang Saya
                  </h2>

                  <p className="text-sm text-slate-500">
                    Ceritakan minat, kemampuan, dan tujuan kamu.
                  </p>
                </div>
              </div>

              <textarea
                rows={5}
                maxLength={1500}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tuliskan deskripsi singkat tentang diri kamu..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {form.bio.length}/1500 karakter
              </p>
            </section>

            {message && (
              <div
                role="status"
                className={`flex items-center gap-2 rounded-lg p-4 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {messageType === "success" && <CheckCircle2 size={18} />}
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {isSaving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
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
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-slate-500">
          Memuat profil...
        </p>
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
