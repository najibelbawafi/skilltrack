
"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  GraduationCap,
  FileText,
  CheckCircle2,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import {
  getStudentProfile,
  saveStudentProfile,
  type StudentProfile,
} from "@/lib/profile";

const subscribeToAuth = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getAuthSnapshot = () => {
  return localStorage.getItem("skilltrack_current_user");
};

const getServerAuthSnapshot = () => null;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSafePhotoUrl(value: string) {
  if (!value.trim()) return "";

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

function ProfileForm({ userId }: { userId: string }) {
  const [form, setForm] = useState<StudentProfile>(() => {
    const defaultProfile: StudentProfile = {
      userId,
      fullName: "",
      email: "",
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
    };

    if (typeof window === "undefined") {
      return defaultProfile;
    }

    const user = getCurrentUser();
    const savedProfile = getStudentProfile(userId);

    return (
      savedProfile ?? {
        ...defaultProfile,
        fullName: user?.name ?? "",
        email: user?.email ?? "",
      }
    );
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  function updateField(
    field: keyof StudentProfile,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
      setMessageType("error");
      setMessage("Sesi akun tidak valid. Silakan login kembali.");
      return;
    }

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const photoUrl = getSafePhotoUrl(form.photoUrl);

    if (!fullName || !email) {
      setMessageType("error");
      setMessage("Nama lengkap dan email wajib diisi.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessageType("error");
      setMessage("Format email tidak valid.");
      return;
    }

    if (photoUrl === null) {
      setMessageType("error");
      setMessage(
        "URL foto harus menggunakan alamat HTTP atau HTTPS yang valid."
      );
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

    try {
      saveStudentProfile({
        ...form,
        userId,
        fullName,
        email,
        photoUrl,
        phone: form.phone.trim(),
        birthPlace: form.birthPlace.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
        major: form.major.trim(),
        school: form.school.trim(),
        startYear,
        graduationYear,
        updatedAt: new Date().toISOString(),
      });

      setMessageType("success");
      setMessage("Profil berhasil disimpan.");
    } catch {
      setMessageType("error");
      setMessage(
        "Profil gagal disimpan. Periksa ruang penyimpanan browser kamu."
      );
    }
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
                <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                  <User size={21} />
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    URL Foto Profil
                  </label>
                  <input
                    type="text"
                    value={form.photoUrl}
                    onChange={(e) => updateField("photoUrl", e.target.value)}
                    placeholder="https://example.com/foto.jpg"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Gunakan URL gambar dengan alamat HTTP atau HTTPS.
                  </p>
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
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0756A5]"
                  />
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
                    onChange={(e) => updateField("graduationYear", e.target.value)}
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <Save size={18} />
                Simpan Profil
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

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-slate-500">Memuat profil...</p>
      </main>
    );
  }

  return <ProfileForm key={userId} userId={userId} />;
}
