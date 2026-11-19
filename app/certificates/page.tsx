
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
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

        const updatedCertificate = mapCertificate(
          data as CertificateRow
        );

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
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0756A5] focus:ring-2 focus:ring-blue-100";

  return (
    <>
      <PageHeader />

      <main className="min-h-screen bg-[#F4F7FB]">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-[#0756A5]">
                PORTOFOLIO SISWA
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#25364A] md:text-3xl">
                Sertifikat Saya
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Kelola dan dokumentasikan sertifikat yang pernah kamu peroleh.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus size={18} />
              Tambah Sertifikat
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                <Award size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Sertifikat</p>
                <p className="text-2xl font-bold text-[#25364A]">
                  {certificates.length}
                </p>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#25364A]">
                  {editingId ? "Edit Sertifikat" : "Tambah Sertifikat"}
                </h2>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Tutup formulir"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>

                  <textarea
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Jelaskan pelatihan, kompetensi, atau pencapaian yang diperoleh..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Foto Sertifikat
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-[#0756A5] hover:bg-blue-50">
                    <Upload size={28} className="text-[#0756A5]" />

                    <span className="mt-3 text-sm font-semibold text-gray-700">
                      Klik untuk upload foto
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                      JPG, PNG, atau WEBP · Maksimal 2 MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {certificateImage && (
                    <div className="mt-4">
                      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
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
                        className="mt-2 text-sm font-medium text-red-600 hover:underline"
                      >
                        Hapus foto
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0756A5] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Menyimpan..."
                      : editingId
                        ? "Simpan Perubahan"
                        : "Simpan Sertifikat"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#25364A]">
              Daftar Sertifikat
            </h2>

            {loadingCertificates ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <p className="text-sm text-gray-500">
                  Memuat sertifikat dari Supabase...
                </p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <Award className="mx-auto text-gray-300" size={42} />

                <h3 className="mt-4 font-semibold text-[#25364A]">
                  Belum Ada Sertifikat
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Sertifikat yang kamu tambahkan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {certificates.map((certificate) => {
                  const safeCredentialUrl = getSafeExternalUrl(
                    certificate.credentialUrl
                  );

                  return (
                    <article
                      key={certificate.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      {certificate.imageDataUrl ? (
                        <div className="relative h-52 w-full border-b border-gray-200 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={certificate.imageDataUrl}
                            alt={`Foto sertifikat ${certificate.title}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-36 items-center justify-center border-b border-gray-200 bg-blue-50">
                          <ImagePlus size={38} className="text-blue-300" />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className="rounded-lg bg-blue-50 p-3 text-[#0756A5]">
                              <Award size={22} />
                            </div>

                            <div>
                              <h3 className="font-bold text-[#25364A]">
                                {certificate.title}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {certificate.issuer}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(certificate)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-[#0756A5]"
                              aria-label="Edit sertifikat"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === certificate.id}
                              onClick={() => handleDelete(certificate.id)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              aria-label="Hapus sertifikat"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={16} />
                          {certificate.issueDate}
                        </div>

                        {certificate.description && (
                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {certificate.description}
                          </p>
                        )}

                        {safeCredentialUrl ? (
                          <a
                            href={safeCredentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:underline"
                          >
                            Lihat Sertifikat
                            <ExternalLink size={15} />
                          </a>
                        ) : certificate.credentialUrl ? (
                          <p className="mt-4 text-xs text-red-500">
                            Link sertifikat tidak valid
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
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
        <p className="text-sm text-gray-500">Memuat sertifikat...</p>
      </main>
    );
  }

  return <CertificateManager key={user.id} userId={user.id} />;
}
