
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
  duration: 0.35,
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

function formatIssueDate(value: string): string {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#0756A5] focus:ring-4 focus:ring-blue-50";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F7F9FC]">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0756A5]">
                <Award size={17} />
                Portofolio Siswa
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Sertifikat Saya
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Kelola dan dokumentasikan sertifikat yang pernah kamu peroleh.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
            >
              <Plus size={18} />
              Tambah Sertifikat
            </button>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.05 }}
            className="mt-7 flex max-w-xs items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
              <Award size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Sertifikat</p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                {certificates.length}
              </p>
            </div>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                role="alert"
                className="mt-5 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Certificate form */}
          <AnimatePresence>
            {showForm && (
              <motion.section
                key="certificate-form"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={transition}
                className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
              >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0756A5]">
                      {editingId ? "Perbarui Data" : "Sertifikat Baru"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {editingId ? "Edit Sertifikat" : "Tambah Sertifikat"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Lengkapi informasi sertifikat yang ingin ditampilkan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Tutup formulir"
                  >
                    <X size={19} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
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
                      <label className={labelClass}>
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
                      <label className={labelClass}>
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
                      <label className={labelClass}>
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
                    <label className={labelClass}>Deskripsi</label>

                    <textarea
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Jelaskan pelatihan, kompetensi, atau pencapaian yang diperoleh..."
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className={labelClass}>
                      Foto Sertifikat
                    </label>

                    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-5 py-7 text-center transition hover:border-[#0756A5] hover:bg-blue-50/50">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5] transition group-hover:scale-105">
                        <Upload size={22} />
                      </div>

                      <span className="mt-3 text-sm font-semibold text-slate-700">
                        Klik untuk upload foto
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, atau WEBP · Maksimal 2 MB
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
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="mt-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Pratinjau Foto
                            </p>

                            <button
                              type="button"
                              onClick={() => setCertificateImage("")}
                              className="text-sm font-medium text-red-600 transition hover:text-red-700"
                            >
                              Hapus foto
                            </button>
                          </div>

                          <div className="mt-3 flex h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={certificateImage}
                              alt="Pratinjau foto sertifikat"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Form actions */}
                  <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0756A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Simpan Sertifikat"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={resetForm}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Certificate list */}
          <section className="mt-9">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Sertifikat
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Semua sertifikat yang sudah kamu dokumentasikan.
              </p>
            </div>

            {loadingCertificates ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mx-auto h-7 w-7 rounded-full border-2 border-blue-100 border-t-[#0756A5]"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Memuat sertifikat dari Supabase...
                </p>
              </div>
            ) : certificates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756A5]">
                  <Award size={29} />
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Belum Ada Sertifikat
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Sertifikat yang kamu tambahkan akan muncul di sini.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.98]"
                >
                  <Plus size={17} />
                  Tambah Sertifikat Pertama
                </button>
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                          ...transition,
                          delay: Math.min(index * 0.04, 0.16),
                        }}
                        whileHover={{ y: -3 }}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* Certificate image */}
                        {certificate.imageDataUrl ? (
                          <div className="flex h-52 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50 p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={certificate.imageDataUrl}
                              alt={`Foto sertifikat ${certificate.title}`}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center border-b border-slate-100 bg-slate-50">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0756A5] shadow-sm ring-1 ring-slate-200">
                              <ImagePlus size={27} />
                            </div>
                          </div>
                        )}

                        <div className="p-5 md:p-6">
                          {/* Title and actions */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0756A5]">
                                <Award size={21} />
                              </div>

                              <div className="min-w-0">
                                <h3 className="break-words font-bold leading-6 text-slate-900">
                                  {certificate.title}
                                </h3>

                                <p className="mt-1 break-words text-sm text-slate-500">
                                  {certificate.issuer}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(certificate)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#0756A5]"
                                aria-label="Edit sertifikat"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === certificate.id}
                                onClick={() => handleDelete(certificate.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label="Hapus sertifikat"
                              >
                                {deletingId === certificate.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Issue date */}
                          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                            <CalendarDays
                              size={15}
                              className="shrink-0 text-[#0756A5]"
                            />
                            <span>
                              Diterbitkan {formatIssueDate(certificate.issueDate)}
                            </span>
                          </div>

                          {/* Description */}
                          {certificate.description && (
                            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                              {certificate.description}
                            </p>
                          )}

                          {/* Credential link */}
                          {safeCredentialUrl ? (
                            <a
                              href={safeCredentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-semibold text-[#0756A5] transition hover:text-blue-800"
                            >
                              Lihat Sertifikat
                              <ExternalLink size={15} />
                            </a>
                          ) : certificate.credentialUrl ? (
                            <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-red-500">
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
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
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

          <p className="mt-4 text-sm text-slate-500">
            Memuat sertifikat...
          </p>
        </div>
      </main>
    );
  }

  return <CertificateManager key={user.id} userId={user.id} />;
}
