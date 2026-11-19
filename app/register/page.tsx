
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 !text-[#25364A] placeholder:!text-gray-400 outline-none transition focus:border-[#0756A5] focus:ring-2 focus:ring-[#0756A5]/10";

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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
              required
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
              className={inputClass}
              placeholder="nama@email.com"
              autoComplete="email"
              required
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
              className={inputClass}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              required
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
              className={inputClass}
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-relaxed text-green-700">
              {success}
            </div>
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
