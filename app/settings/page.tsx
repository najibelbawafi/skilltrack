
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Save,
  Settings,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  EyeOff as PrivateIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";

function SettingsForm({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
  };
}) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isPublic, setIsPublic] = useState(false);
  const [publicationLoaded, setPublicationLoaded] = useState(false);
  const [publicationSaving, setPublicationSaving] = useState(false);
  const [publicationMessage, setPublicationMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPublicationSettings() {
      try {
        const { data, error } = await supabase
          .from("publication_settings")
          .select("is_public")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          setIsPublic(data?.is_public ?? false);
        }
      } catch (error) {
        console.error("Gagal memuat publikasi:", error);

        if (mounted) {
          setPublicationMessage(
            "Pengaturan publikasi gagal dimuat."
          );
        }
      } finally {
        if (mounted) {
          setPublicationLoaded(true);
        }
      }
    }

    loadPublicationSettings();

    return () => {
      mounted = false;
    };
  }, [user.id]);

  async function handlePublicationToggle() {
    if (publicationSaving) return;

    setPublicationSaving(true);
    setPublicationMessage("");

    const nextValue = !isPublic;

    try {
      const { error } = await supabase
        .from("publication_settings")
        .upsert(
          {
            user_id: user.id,
            is_public: nextValue,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) throw error;

      setIsPublic(nextValue);
    } catch (error) {
      console.error("Gagal menyimpan publikasi:", error);

      setPublicationMessage(
        "Gagal menyimpan perubahan publikasi."
      );
    } finally {
      setPublicationSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      setMessage("Nama dan email wajib diisi.");
      return;
    }

    if (!currentPassword) {
      setMessage("Masukkan password saat ini untuk konfirmasi.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setMessage("Password baru minimal 8 karakter.");
      return;
    }

    setIsSaving(true);

    try {
      // Verifikasi password akun yang sedang digunakan.
      const { error: verificationError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (verificationError) {
        throw new Error("Password saat ini tidak sesuai.");
      }

      const updateData: {
        data: { full_name: string };
        email?: string;
        password?: string;
      } = {
        data: {
          full_name: normalizedName,
        },
      };

      const emailChanged =
        normalizedEmail !== user.email.toLowerCase();

      if (emailChanged) {
        updateData.email = normalizedEmail;
      }

      if (newPassword) {
        updateData.password = newPassword;
      }

      const { error: updateError } =
        await supabase.auth.updateUser(updateData);

      if (updateError) {
        throw updateError;
      }

      // Sinkronkan nama ke tabel profil Supabase.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: normalizedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error(
          "Nama Auth berhasil diperbarui, tetapi profil gagal diperbarui:",
          profileError
        );

        setMessage(
          "Informasi akun berhasil diperbarui, tetapi sinkronisasi nama profil gagal."
        );
        setIsSuccess(false);
      } else if (emailChanged) {
        setMessage(
          "Nama akun berhasil diperbarui. Periksa email baru untuk menyelesaikan konfirmasi perubahan alamat email."
        );
        setIsSuccess(true);
      } else {
        setMessage("Pengaturan akun berhasil diperbarui.");
        setIsSuccess(true);
      }

      setName(normalizedName);
      setEmail(normalizedEmail);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Gagal memperbarui akun:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan pengaturan."
      );

      setIsSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (!publicationLoaded) {
    return (
      <main className="min-h-screen bg-[#F4F7FB]">
        <PageHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-gray-500">
            Memuat pengaturan...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0756A5]">
            <Settings size={17} />
            PENGATURAN AKUN
          </div>

          <h1 className="text-3xl font-bold text-[#25364A]">
            Pengaturan Akun
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Kelola informasi akun, keamanan, dan privasi portofolio SkillTrack.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#25364A]">
                Privasi Portofolio
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Atur apakah portofoliomu dapat ditemukan oleh pengunjung
                Direktori Siswa.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={22} className="text-green-600" />
              ) : (
                <PrivateIcon size={22} className="text-gray-500" />
              )}

              <div>
                <p className="font-semibold text-[#25364A]">
                  {isPublic ? "Portofolio Publik" : "Portofolio Privat"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {isPublic
                    ? "Profilmu dapat ditemukan di Direktori Siswa."
                    : "Profilmu tidak ditampilkan di Direktori Siswa."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePublicationToggle}
              disabled={publicationSaving}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPublic
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#0756A5] hover:bg-blue-800"
              }`}
            >
              {publicationSaving
                ? "Menyimpan..."
                : isPublic
                  ? "Jadikan Privat"
                  : "Jadikan Publik"}
            </button>
          </div>

          {publicationMessage && (
            <p className="mt-3 text-sm text-red-600">
              {publicationMessage}
            </p>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Pengaturan ini juga berlaku pada fitur publikasi di halaman
            Preview Portofolio.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <h2 className="text-lg font-bold text-[#25364A]">
              Informasi Akun
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Perbarui nama dan alamat email akunmu.
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-[#25364A]">
              Keamanan Akun
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Masukkan password saat ini untuk mengonfirmasi perubahan.
            </p>
          </div>

          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password Saat Ini
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                placeholder="Masukkan password saat ini"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-sm text-gray-800 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password Baru
              <span className="ml-2 font-normal text-gray-400">
                (Opsional)
              </span>
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-gray-400">
              Kosongkan jika tidak ingin mengganti password.
            </p>
          </div>

          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                isSuccess
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Batal
            </Link>
          </div>
        </form>

        <div className="mt-6 rounded-xl border border-red-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-red-700">
                Hapus Akun
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Penghapusan akun akan menghapus data profil, proyek,
                sertifikat, pencapaian, dan pengaturan publikasi akun ini.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Penghapusan akun sementara belum tersedia.
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Fitur ini membutuhkan proses penghapusan yang aman melalui
              backend Supabase. Akun dan data tidak akan dihapus dari
              browser secara langsung.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-400"
          >
            <Trash2 size={17} />
            Hapus Akun Saya
          </button>
        </div>
      </section>
    </main>
  );
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">
          Memuat pengaturan...
        </p>
      </main>
    );
  }

  return (
    <SettingsForm
      key={user.id}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
      }}
    />
  );
}
