
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ChartNoAxesCombined,
  FolderKanban,
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
              Student Portfolio Platform
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Bangun portofolio.
              <br />
              Tunjukkan potensimu.
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Dokumentasikan pengalaman, keterampilan, dan pencapaianmu
              dalam satu platform yang terorganisir.
            </p>

            <div className="mt-12 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <p className="font-semibold">Kelola portofolio</p>
                  <p className="mt-1 text-sm text-blue-200">
                    Simpan proyek dan pengalamanmu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ChartNoAxesCombined size={20} />
                </div>
                <div>
                  <p className="font-semibold">Pantau perkembangan</p>
                  <p className="mt-1 text-sm text-blue-200">
                    Dokumentasikan kompetensi dan pencapaian.
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

      {/* Form login */}
      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0756A5]"
          >
            <ArrowLeft size={17} />
            Kembali ke Beranda
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-9 lg:hidden">
              <Image
                src="/skilltrack-icon.svg"
                alt="Logo SkillTrack"
                width={54}
                height={54}
                priority
                className="rounded-xl"
              />
            </div>

            <div className="mb-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0756A5]">
                SKILLTRACK
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Selamat Datang
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masuk ke akunmu untuk melanjutkan pengelolaan portofolio
                dan perkembangan kompetensi.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Alamat Email
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-50">
                  <Mail
                    size={18}
                    className="shrink-0 text-slate-400"
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
                    className="w-full bg-transparent px-3.5 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
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

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0756A5] focus-within:ring-4 focus-within:ring-blue-50">
                  <Lock
                    size={18}
                    className="shrink-0 text-slate-400"
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
                    className="w-full bg-transparent px-3.5 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
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
                    Masuk ke Akun
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">ATAU</span>
              <div className="h-px flex-1 bg-slate-200" />
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
          </motion.div>

          <p className="mt-12 text-center text-xs text-slate-400 lg:hidden">
            © 2026 SkillTrack. Student Portfolio Platform.
          </p>
        </div>
      </section>
    </main>
  );
}
