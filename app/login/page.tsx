
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) {
        if (
          loginError.message.toLowerCase().includes("email not confirmed")
        ) {
          setError(
            "Email belum diverifikasi. Periksa kotak masuk email kamu."
          );
        } else {
          setError("Email atau password salah.");
        }
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F7FB] px-5 py-12">
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

        <div className="glass-card relative overflow-hidden p-7 sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-gradient-to-br from-white to-blue-50 text-[#0756A5] shadow-lg shadow-blue-900/5"
            >
              <GraduationCap size={32} strokeWidth={1.8} />
            </motion.div>

            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#0756A5]">
                SKILLTRACK
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[#25364A] sm:text-3xl">
                Selamat Datang
              </h1>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Masuk ke akun SkillTrack untuk mengelola portofolio dan
                perkembangan kompetensimu.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="group flex items-center rounded-xl border border-slate-200/90 bg-white/85 px-4 transition-all duration-200 focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-100">
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
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
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

                <div className="group flex items-center rounded-xl border border-slate-200/90 bg-white/85 px-4 transition-all duration-200 focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-100">
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
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-slate-400 transition hover:text-[#0756A5]"
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
                    Masuk ke Akun
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
              Belum memiliki akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#0756A5] transition hover:text-blue-800 hover:underline"
              >
                Buat Akun
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
