
"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode, ElementType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
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
          setPublicationMessage("Pengaturan publikasi gagal dimuat.");
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
      setPublicationMessage("Gagal menyimpan perubahan publikasi.");
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
          <div className="glass flex items-center gap-3 rounded-2xl px-6 py-5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0756A5]/20 border-t-[#0756A5]" />
            <p className="text-sm text-gray-500">
              Memuat pengaturan...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <PageHeader />

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0756A5]">
            <Settings size={17} />
            PENGATURAN AKUN
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#25364A]">
            Pengaturan Akun
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Kelola informasi akun, keamanan, dan privasi portofolio SkillTrack.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="glass-card mb-6 p-5 sm:p-8"
        >
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#25364A]">
                Privasi Portofolio
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Atur apakah portofoliomu dapat ditemukan oleh pengunjung
                Direktori Siswa.
              </p>
            </div>
          </div>

          <div className="glass-strong flex flex-col justify-between gap-5 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isPublic
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isPublic ? (
                  <Globe size={21} />
                ) : (
                  <PrivateIcon size={21} />
                )}
              </div>

              <div>
                <p className="font-semibold text-[#25364A]">
                  {isPublic ? "Portofolio Publik" : "Portofolio Privat"}
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
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
              className={`glass-button rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
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

          <p className="mt-4 text-xs leading-5 text-gray-400">
            Pengaturan ini juga berlaku pada fitur publikasi di halaman
            Preview Portofolio.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
          onSubmit={handleSubmit}
          className="glass-card space-y-7 p-5 sm:p-8"
        >
          <div>
            <h2 className="text-lg font-bold text-[#25364A]">
              Informasi Akun
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Perbarui nama dan alamat email akunmu.
            </p>
          </div>

          <div className="space-y-5">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white/90 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white/90 py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/70 pt-6">
            <h2 className="text-lg font-bold text-[#25364A]">
              Keamanan Akun
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Masukkan password saat ini untuk mengonfirmasi perubahan.
            </p>
          </div>

          <div className="space-y-5">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className="w-full rounded-xl border border-gray-200 bg-white/90 py-3.5 pl-11 pr-12 text-sm text-gray-800 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#0756A5]"
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
                className="w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Kosongkan jika tidak ingin mengganti password.
              </p>
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                isSuccess
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-200/70 pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="glass-button inline-flex items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <Link
              href="/dashboard"
              className="glass-button inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold text-gray-600"
            >
              Batal
            </Link>
          </div>
        </motion.form>
      </section>
    </main>
  );
}

function SettingsSection({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
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
        <div className="glass flex items-center gap-3 rounded-2xl px-6 py-5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0756A5]/20 border-t-[#0756A5]" />
          <p className="text-sm text-gray-500">
            Memuat pengaturan...
          </p>
        </div>
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
