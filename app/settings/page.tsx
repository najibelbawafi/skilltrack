
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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

import {
  getCurrentUser,
  updateUserAccount,
  deleteUserAccount,
} from "@/lib/auth";

import {
  getPublicationSettings,
  savePublicationSettings,
} from "@/lib/publication";

function subscribeAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAuthSnapshot() {
  return localStorage.getItem("skilltrack_current_user");
}

function getAuthServerSnapshot() {
  return undefined;
}

function subscribePublication(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("skilltrack-publication", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skilltrack-publication", callback);
  };
}

function getPublicationSnapshot(userId: string) {
  return getPublicationSettings(userId).isPublic;
}

function getPublicationServerSnapshot() {
  return false;
}

type SettingsFormProps = {
  user: NonNullable<ReturnType<typeof getCurrentUser>>;
};

function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const isPublic = useSyncExternalStore(
    subscribePublication,
    () => getPublicationSnapshot(user.id),
    getPublicationServerSnapshot
  );

  function handlePublicationToggle() {
    savePublicationSettings(user.id, !isPublic);
    window.dispatchEvent(new Event("skilltrack-publication"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSaving(true);

    try {
      const result = await updateUserAccount(
        user.id,
        name,
        email,
        currentPassword,
        newPassword || undefined
      );

      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setName(name.trim());
        setEmail(email.trim().toLowerCase());
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setMessage("Terjadi kesalahan saat menyimpan pengaturan.");
      setIsSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    setDeleteMessage("");
    setIsDeleting(true);

    try {
      const result = await deleteUserAccount(user.id, deletePassword);

      setDeleteMessage(result.message);

      if (result.success) {
        window.dispatchEvent(new Event("storage"));
        router.replace("/login");
      }
    } catch {
      setDeleteMessage("Terjadi kesalahan saat menghapus akun.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-[#0756A5]">
            SkillTrack
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0756A5]"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

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
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                isPublic
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#0756A5] hover:bg-blue-800"
              }`}
            >
              {isPublic ? "Jadikan Privat" : "Jadikan Publik"}
            </button>
          </div>

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
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            <label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                placeholder="Masukkan password saat ini"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-sm text-gray-800 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Password Baru
              <span className="ml-2 font-normal text-gray-400">(Opsional)</span>
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
            <div className={`rounded-lg px-4 py-3 text-sm ${
              isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
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

          {!showDeleteConfirmation ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />
              Hapus Akun Saya
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Apakah kamu yakin ingin menghapus akun?
                </p>
                <p className="mt-1 text-xs text-red-600">
                  Tindakan ini tidak dapat dibatalkan. Masukkan password
                  akun untuk melanjutkan.
                </p>
              </div>

              <div>
                <label htmlFor="deletePassword" className="mb-2 block text-sm font-medium text-gray-700">
                  Password Akun
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password akun"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {deleteMessage && (
                <p className="text-sm text-red-600">{deleteMessage}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  {isDeleting ? "Menghapus..." : "Konfirmasi Hapus Akun"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeletePassword("");
                    setDeleteMessage("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const userId = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const user = userId ? getCurrentUser() : null;

  useEffect(() => {
    if (userId === null || (userId && !getCurrentUser())) {
      router.replace("/login");
    }
  }, [userId, router]);

  if (userId === undefined || userId === null || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <p className="text-sm text-gray-500">Memuat pengaturan...</p>
      </main>
    );
  }

  return <SettingsForm key={user.id} user={user} />;
}
