
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

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
      const result = await registerUser(name, email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/login");
    } catch {
      setError("Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-2xl font-bold text-[#0756A5]">
          SkillTrack
        </Link>

        <h1 className="mt-8 text-2xl font-bold text-[#25364A]">
          Buat Akun
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Daftar untuk mulai membangun portofolio digitalmu.
        </p>

        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0756A5]"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0756A5]"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0756A5]"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0756A5]"
              placeholder="Ulangi password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0756A5] py-3 font-semibold text-white transition hover:bg-[#064783] disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-[#0756A5]">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
