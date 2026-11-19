
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CalendarDays,
  X,
  ImagePlus,
  Upload,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/app/providers";
import { supabase } from "@/lib/supabase";
import type { StudentCertificate } from "@/lib/certificates";

type CertificateRow = {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description: string;
  credential_url: string;
  image_url: string | null;
  created_at: string;
};

const transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function mapCertificate(row: CertificateRow): StudentCertificate {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    issuer: row.issuer,
    issueDate: row.issue_date,
    description: row.description,
    credentialUrl: row.credential_url,
    imageDataUrl: row.image_url ?? "",
    createdAt: row.created_at,
  };
}

function getSafeExternalUrl(value: string): string | null {
  if (!value.trim()) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function CertificateManager({ userId }: { userId: string }) {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [certificateImage, setCertificateImage] = useState("");

  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCertificates() {
      setLoadingCertificates(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Gagal memuat sertifikat:", error);
        setErrorMessage("Gagal memuat sertifikat. Silakan coba kembali.");
        setLoadingCertificates(false);
        return;
      }

      const rows = (data ?? []) as CertificateRow[];

      setCertificates(rows.map(mapCertificate));
      setLoadingCertificates(false);
    }

    loadCertificates();

    return () => {
      active = false;
    };
  }, [userId]);

  function resetForm() {
    setTitle("");
    setIssuer("");
    setIssueDate("");
    setDescription("");
    setCredentialUrl("");
    setCertificateImage("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      window.alert("Gunakan file JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Ukuran foto maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result === "string" &&
        reader.result.startsWith("data:image/")
      ) {
        setCertificateImage(reader.result);
      } else {
        window.alert("Format gambar tidak valid.");
      }
    };

    reader.onerror = () => {
      window.alert("Gagal membaca foto. Silakan coba lagi.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const trimmedUrl = credentialUrl.trim();

    if (trimmedUrl && !getSafeExternalUrl(trimmedUrl)) {
      window.alert(
        "Link sertifikat tidak valid. Gunakan alamat https:// atau http://."
      );
      return;
    }

    const certificateData = {
      user_id: userId,
      title: title.trim(),
      issuer: issuer.trim(),
      issue_date: issueDate,
      description: description.trim(),
      credential_url: trimmedUrl,
      image_url: certificateImage || null,
    };

    setSaving(true);
    setErrorMessage("");

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("certificates")
          .update(certificateData)
          .eq("id", editingId)
          .eq("user_id", userId)
          .select("*")
          .single();

        if (error) throw error;

        const updatedCertificate = mapCertificate(data as CertificateRow);

        setCertificates((previous) =>
          previous.map((item) =>
            item.id === editingId ? updatedCertificate : item
          )
        );
      } else {
        const { data, error } = await supabase
          .from("certificates")
          .insert(certificateData)
          .select("*")
          .single();

        if (error) throw error;

        const newCertificate = mapCertificate(data as CertificateRow);

        setCertificates((previous) => [newCertificate, ...previous]);
      }

      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan sertifikat:", error);
      setErrorMessage(
        "Gagal menyimpan sertifikat. Periksa koneksi dan konfigurasi Supabase."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(certificate: StudentCertificate) {
    setEditingId(certificate.id);
    setTitle(certificate.title);
    setIssuer(certificate.issuer);
    setIssueDate(certificate.issueDate);
    setDescription(certificate.description);
    setCredentialUrl(certificate.credentialUrl);
    setCertificateImage(certificate.imageDataUrl ?? "");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus sertifikat ini?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setCertificates((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Gagal menghapus sertifikat:", error);
      setErrorMessage("Gagal menghapus sertifikat. Silakan coba kembali.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white/85 px-4 py-3 text-sm text-[#25364A] placeholder:text-gray-400 outline-none transition-all focus:border-[#0756A5] focus:ring-4 focus:ring-blue-100/70";

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F4F7FB]">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="glass-strong relative overflow-hidden rounded-[28px] p-6 md:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#0756A5]">
                  <Award size={15} />
                  PORTOFOLIO SISWA
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#25364A] md:text-3xl">
                  Sertifikat Saya
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  Kelola dan dokumentasikan sertifikat yang pernah kamu
                  peroleh.
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="glass-button inline-flex items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition-colors hover:bg-blue-800"
              >
                <Plus size={18} />
                Tambah Sertifikat
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.08 }}
            className="glass-card mt-6 flex items-center gap-4 rounded-[22px] p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
              <Award size={24} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Sertifikat</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-[#25364A]">
                {certificates.length}
              </p>
            </div>
          </motion.div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                role="alert"
                className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showForm && (
              <motion.section
                key="certificate-form"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={transition}
                className="glass-strong mt-7 rounded-[26px] p-5 md:p-8"
              >
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[#0756A5]">
                      {editingId ? "PERBARUI DATA" : "SERTIFIKAT BARU"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#25364A]">
                      {editingId ? "Edit Sertifikat" : "Tambah Sertifikat"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Lengkapi informasi sertifikat yang ingin ditampilkan.
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200/80 bg-white/70 text-gray-500 transition-colors hover:bg-white hover:text-gray-800"
                    aria-label="Tutup formulir"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                        Nama Sertifikat *
                      </label>

                      <input
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Contoh: Sertifikat IoT Fundamentals"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                        Penerbit / Penyelenggara *
                      </label>

                      <input
                        required
                        value={issuer}
                        onChange={(event) => setIssuer(event.target.value)}
                        placeholder="Contoh: Dicoding Indonesia"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                        Tanggal Diterbitkan *
                      </label>

                      <input
                        required
                        type="date"
                        value={issueDate}
                        onChange={(event) => setIssueDate(event.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                        Link Sertifikat
                      </label>

                      <input
                        type="url"
                        value={credentialUrl}
                        onChange={(event) =>
                          setCredentialUrl(event.target.value)
                        }
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                      Deskripsi
                    </label>

                    <textarea
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Jelaskan pelatihan, kompetensi, atau pencapaian yang diperoleh..."
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#34465B]">
                      Foto Sertifikat
                    </label>

                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/55 p-7 text-center transition-all hover:border-[#0756A5] hover:bg-blue-50/60">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5] transition-transform group-hover:scale-105">
                        <Upload size={23} />
                      </div>

                      <span className="mt-3 text-sm font-semibold text-gray-700">
                        Klik untuk upload foto
                      </span>

                      <span className="mt-1 text-xs text-gray-500">
                        JPG, PNG, atau WEBP - Maksimal 2 MB
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    <AnimatePresence>
                      {certificateImage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-4"
                        >
                          <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={certificateImage}
                              alt="Pratinjau foto sertifikat"
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setCertificateImage("")}
                            className="mt-3 text-sm font-medium text-red-600 transition-colors hover:text-red-700 hover:underline"
                          >
                            Hapus foto
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-gray-200/70 pt-5">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={!saving ? { y: -2 } : undefined}
                      whileTap={!saving ? { scale: 0.97 } : undefined}
                      className="rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Sertifikat"}
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={saving}
                      whileHover={!saving ? { y: -2 } : undefined}
                      whileTap={!saving ? { scale: 0.97 } : undefined}
                      onClick={resetForm}
                      className="rounded-xl border border-gray-200 bg-white/70 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-white disabled:opacity-50"
                    >
                      Batal
                    </motion.button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="mt-9">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#25364A]">
                Daftar Sertifikat
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Semua sertifikat yang sudah kamu dokumentasikan.
              </p>
            </div>

            {loadingCertificates ? (
              <div className="glass-strong rounded-[24px] px-6 py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Memuat sertifikat dari Supabase...
                </p>
              </div>
            ) : certificates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="glass-strong rounded-[26px] border border-dashed border-gray-300/80 px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <Award size={30} />
                </div>

                <h3 className="mt-5 font-semibold text-[#25364A]">
                  Belum Ada Sertifikat
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Sertifikat yang kamu tambahkan akan muncul di sini.
                </p>

                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-800"
                >
                  <Plus size={17} />
                  Tambah Sertifikat Pertama
                </motion.button>
              </motion.div>
            ) : (
              <motion.div layout className="grid gap-5 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {certificates.map((certificate, index) => {
                    const safeCredentialUrl = getSafeExternalUrl(
                      certificate.credentialUrl
                    );

                    return (
                      <motion.article
                        key={certificate.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{
                          ...transition,
                          delay: Math.min(index * 0.045, 0.2),
                        }}
                        whileHover={{ y: -4 }}
                        className="glass-card overflow-hidden rounded-[24px]"
                      >
                        {certificate.imageDataUrl ? (
                          <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-gray-200/70 bg-white/70 p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={certificate.imageDataUrl}
                              alt={`Foto sertifikat ${certificate.title}`}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center border-b border-gray-200/70 bg-gradient-to-br from-blue-50 to-white">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-white/80 text-[#0756A5] shadow-sm">
                              <ImagePlus size={29} />
                            </div>
                          </div>
                        )}

                        <div className="p-5 md:p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                                <Award size={22} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="break-words font-bold text-[#25364A]">
                                  {certificate.title}
                                </h3>

                                <p className="mt-1 break-words text-sm text-gray-500">
                                  {certificate.issuer}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(certificate)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-blue-50 hover:text-[#0756A5]"
                                aria-label="Edit sertifikat"
                              >
                                <Pencil size={16} />
                              </motion.button>

                              <motion.button
                                type="button"
                                disabled={deletingId === certificate.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(certificate.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label="Hapus sertifikat"
                              >
                                {deletingId === certificate.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={15} className="text-[#0756A5]" />
                            {certificate.issueDate}
                          </div>

                          {certificate.description && (
                            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                              {certificate.description}
                            </p>
                          )}

                          {safeCredentialUrl ? (
                            <a
                              href={safeCredentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-2 border-t border-gray-200/70 pt-4 text-sm font-semibold text-[#0756A5] transition-colors hover:text-blue-800"
                            >
                              Lihat Sertifikat
                              <ExternalLink size={15} />
                            </a>
                          ) : certificate.credentialUrl ? (
                            <p className="mt-5 border-t border-gray-200/70 pt-4 text-xs text-red-500">
                              Link sertifikat tidak valid
                            </p>
                          ) : null}
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}

export default function CertificatesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
          />
          <p className="mt-4 text-sm text-gray-500">Memuat sertifikat...</p>
        </div>
      </main>
    );
  }

  return <CertificateManager key={user.id} userId={user.id} />;
}
