
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
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
    "w-full bg-transparent px-3 py-3.5 text-sm text-[#25364A] outline-none placeholder:text-slate-400";

  const fieldClass =
    "group flex items-center rounded-xl border border-slate-200/90 bg-white/85 px-4 transition-all duration-200 focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-100";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F7FB] px-5 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-1/3 top-1/3 h-56 w-56 rounded-full bg-white/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-x-1 hover:text-[#0756A5]"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="glass-card relative overflow-hidden p-7 sm:p-9">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-white to-blue-50 text-[#0756A5] shadow-lg shadow-blue-900/5"
            >
              <GraduationCap size={32} strokeWidth={1.8} />
            </motion.div>

            <div className="mb-7 text-center">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#0756A5]">
                SKILLTRACK
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
                Buat Akun Baru
              </h1>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Mulai bangun portofolio digital dan dokumentasikan
                perkembangan kompetensimu.
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
                  <User
                    size={18}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[#0756A5]"
                  />
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
                  Email
                </label>

                <div className={fieldClass}>
                  <Mail
                    size={18}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[#0756A5]"
                  />
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
                  <Lock
                    size={18}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[#0756A5]"
                  />
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
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Password
                </label>

                <div className={fieldClass}>
                  <Lock
                    size={18}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[#0756A5]"
                  />
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
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0"
                      />
                      <p>{success}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -2 }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="glass-button flex w-full items-center justify-center gap-2 rounded-xl bg-[#0756A5] py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#064783] disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="h-px flex-1 bg-slate-200/80" />
              <span className="text-xs text-slate-400">ATAU</span>
              <div className="h-px flex-1 bg-slate-200/80" />
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
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-slate-400">
          © 2026 SkillTrack. Student Portfolio Platform.
        </p>
      </motion.div>
    </main>
  );
}
