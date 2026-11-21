
"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";

type SettingsUser = {
  id: string;
  name: string;
  email: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-[#25364A] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70";

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

      <div className="min-w-0">
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

function SettingsForm({ user }: { user: SettingsUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isPublic, setIsPublic] = useState(false);
  const [publicationLoaded, setPublicationLoaded] = useState(false);
  const [publicationSaving, setPublicationSaving] = useState(false);
  const [publicationMessage, setPublicationMessage] = useState("");
  const [publicationError, setPublicationError] = useState(false);

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
          setPublicationError(true);
          setPublicationMessage(
            "Pengaturan publikasi gagal dimuat. Silakan muat ulang halaman."
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
    if (publicationSaving || publicationError) return;

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
      setPublicationMessage(
        nextValue
          ? "Portofolio sekarang dapat ditemukan di Direktori Siswa."
          : "Portofolio sekarang bersifat privat."
      );
    } catch (error) {
      console.error("Gagal menyimpan publikasi:", error);

      setPublicationError(false);
      setPublicationMessage(
        "Gagal menyimpan perubahan publikasi. Silakan coba kembali."
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Format email tidak valid.");
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
      <>
        <PageHeader />
        <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
            <LoaderCircle
              size={19}
              className="animate-spin text-[#0756A5]"
            />
            Memuat pengaturan...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          {/* HEADER */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#0756A5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0756A5]" />
              PENGATURAN AKUN
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
              Pengaturan Akun
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola informasi akun, keamanan, dan privasi portofolio
              SkillTrack.
            </p>
          </div>

          <div className="space-y-5">
            {/* PRIVASI PORTOFOLIO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                icon={ShieldCheck}
                title="Privasi Portofolio"
                description="Atur visibilitas profilmu di Direktori Siswa."
              />

              <div className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isPublic
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isPublic ? (
                      <Globe size={21} />
                    ) : (
                      <PrivateIcon size={21} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#25364A]">
                        {isPublic
                          ? "Portofolio Publik"
                          : "Portofolio Privat"}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          isPublic
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isPublic ? "PUBLIK" : "PRIVAT"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {isPublic
                        ? "Profilmu dapat ditemukan oleh pengunjung Direktori Siswa."
                        : "Profilmu tidak ditampilkan di Direktori Siswa."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePublicationToggle}
                  disabled={publicationSaving || publicationError}
                  className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isPublic
                      ? "bg-slate-700 hover:bg-slate-800"
                      : "bg-[#0756A5] hover:bg-blue-800"
                  }`}
                >
                  {publicationSaving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : null}

                  {publicationSaving
                    ? "Menyimpan..."
                    : isPublic
                      ? "Jadikan Privat"
                      : "Jadikan Publik"}
                </button>
              </div>

              {publicationMessage && (
                <p
                  role="status"
                  className={`mt-3 text-sm ${
                    publicationError
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {publicationMessage}
                </p>
              )}

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Pengaturan ini juga berlaku pada fitur publikasi di halaman
                Preview Portofolio.
              </p>
            </section>

            {/* INFORMASI AKUN */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div>
                <SectionHeading
                  icon={User}
                  title="Informasi Akun"
                  description="Perbarui identitas dan alamat email akunmu."
                />

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Nama Lengkap
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={100}
                        required
                        placeholder="Masukkan nama lengkap"
                        autoComplete="name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Alamat Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        placeholder="nama@email.com"
                        className={inputClass}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Perubahan email mungkin memerlukan konfirmasi melalui
                      email baru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <SectionHeading
                  icon={Lock}
                  title="Keamanan Akun"
                  description="Verifikasi identitas sebelum mengubah informasi akun."
                />

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password Saat Ini
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        required
                        autoComplete="current-password"
                        placeholder="Masukkan password saat ini"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#0756A5]"
                      >
                        {showCurrentPassword ? (
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password Baru
                      <span className="ml-2 font-normal text-slate-400">
                        (Opsional)
                      </span>
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(!showNewPassword)
                        }
                        aria-label={
                          showNewPassword
                            ? "Sembunyikan password baru"
                            : "Tampilkan password baru"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#0756A5]"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Kosongkan jika tidak ingin mengganti password.
                    </p>
                  </div>
                </div>
              </div>

              {/* NOTIFIKASI */}
              {message && (
                <div
                  role="status"
                  className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                  )}

                  <p>{message}</p>
                </div>
              )}

              {/* TOMBOL AKSI */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#0756A5]"
                >
                  Batal
                </Link>
              </div>
            </form>

            {/* INFORMASI TAMBAHAN */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                  <ShieldCheck size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#25364A]">
                    Keamanan dan Privasi
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Pastikan informasi akun selalu diperbarui. Jangan
                    membagikan password kepada orang lain.
                  </p>

                  <Link
                    href="/profile"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] transition hover:text-blue-800"
                  >
                    Periksa Profil Saya
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
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
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          <LoaderCircle
            size={19}
            className="animate-spin text-[#0756A5]"
          />
          Memuat pengaturan...
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
