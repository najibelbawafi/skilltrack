
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  FolderKanban,
  ChartNoAxesCombined,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: registerError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

      if (registerError) {
        if (
          registerError.message.toLowerCase().includes("already registered")
        ) {
          setError("Email ini sudah terdaftar. Silakan login.");
        } else {
          setError(registerError.message);
        }
        return;
      }

      if (data.user) {
        setSuccess(
          "Pendaftaran berhasil. Silakan periksa email kamu dan klik tautan verifikasi sebelum login ke SkillTrack."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Pendaftaran gagal. Periksa koneksi internet dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-transparent px-3.5 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400";

  const fieldClass =
    "group flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-50";

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Panel branding */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#0756A5] p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <Image
            src="/skilltrack-icon.svg"
            alt="SkillTrack"
            width={44}
            height={44}
            priority
            className="rounded-xl"
          />
          <span className="text-xl font-bold tracking-tight">
            SkillTrack
          </span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              Start Your Journey
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Setiap pengalaman
              <br />
              punya nilai.
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Mulai dokumentasikan perjalanan belajarmu, kumpulkan
              pencapaian, dan bangun portofolio digital yang menunjukkan
              kemampuanmu.
            </p>

            <div className="mt-12 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <p className="font-semibold">Portofolio terorganisir</p>
                  <p className="mt-1 text-sm text-blue-200">
                    Dokumentasikan proyek dan pengalaman.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ChartNoAxesCombined size={20} />
                </div>
                <div>
                  <p className="font-semibold">Perkembangan kompetensi</p>
                  <p className="mt-1 text-sm text-blue-200">
                    Catat keterampilan dan pencapaianmu.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-blue-200">
          © 2026 SkillTrack. Student Portfolio Platform.
        </p>
      </section>

      {/* Form registrasi */}
      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0756A5]"
          >
            <ArrowLeft size={17} />
            Kembali ke Beranda
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-7 lg:hidden">
              <Image
                src="/skilltrack-icon.svg"
                alt="Logo SkillTrack"
                width={54}
                height={54}
                priority
                className="rounded-xl"
              />
            </div>

            <div className="mb-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0756A5]">
                SKILLTRACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Buat Akun Baru
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Daftarkan akunmu dan mulai bangun portofolio digital.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama Lengkap
                </label>

                <div className={fieldClass}>
                  <User size={18} className="shrink-0 text-slate-400 group-focus-within:text-[#0756A5]" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    className={inputClass}
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    required
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

                <div className={fieldClass}>
                  <Mail size={18} className="shrink-0 text-slate-400 group-focus-within:text-[#0756A5]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={inputClass}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className={fieldClass}>
                  <Lock size={18} className="shrink-0 text-slate-400 group-focus-within:text-[#0756A5]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className={inputClass}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-slate-400 transition hover:text-[#0756A5]"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Password
                </label>

                <div className={fieldClass}>
                  <Lock size={18} className="shrink-0 text-slate-400 group-focus-within:text-[#0756A5]" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className={inputClass}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="shrink-0 text-slate-400 transition hover:text-[#0756A5]"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="overflow-hidden"
                  >
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
                    >
                      {error}
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="overflow-hidden"
                  >
                    <div
                      role="status"
                      className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
                    >
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                      <p>{success}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -1 }}
                whileTap={loading ? undefined : { scale: 0.99 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0756A5] py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-[#064783] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">ATAU</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#0756A5] transition hover:text-blue-800 hover:underline"
              >
                Login
              </Link>
            </p>
          </motion.div>

          <p className="mt-10 text-center text-xs text-slate-400 lg:hidden">
            © 2026 SkillTrack. Student Portfolio Platform.
          </p>
        </div>
      </section>
    </main>
  );
}
