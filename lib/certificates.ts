
export type StudentCertificate = {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  credentialUrl: string;
  imageDataUrl?: string;
  createdAt: string;
};

const CERTIFICATE_KEY = "skilltrack_certificates";

function isStudentCertificate(
  value: unknown
): value is StudentCertificate {
  if (!value || typeof value !== "object") return false;

  const certificate = value as Record<string, unknown>;

  return (
    typeof certificate.id === "string" &&
    typeof certificate.userId === "string" &&
    typeof certificate.title === "string" &&
    typeof certificate.issuer === "string" &&
    typeof certificate.issueDate === "string" &&
    typeof certificate.description === "string" &&
    typeof certificate.credentialUrl === "string" &&
    (certificate.imageDataUrl === undefined ||
      typeof certificate.imageDataUrl === "string") &&
    typeof certificate.createdAt === "string"
  );
}

function getAllCertificates(): StudentCertificate[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(CERTIFICATE_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStudentCertificate);
  } catch {
    return [];
  }
}

export function getStudentCertificates(
  userId: string
): StudentCertificate[] {
  if (!userId) return [];

  return getAllCertificates().filter(
    (certificate) => certificate.userId === userId
  );
}

export function saveStudentCertificates(
  userId: string,
  certificates: StudentCertificate[]
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!userId || !Array.isArray(certificates)) {
    throw new Error("Data sertifikat tidak valid.");
  }

  const validCertificates = certificates.filter(
    (certificate) =>
      isStudentCertificate(certificate) &&
      certificate.userId === userId
  );

  if (validCertificates.length !== certificates.length) {
    throw new Error("Terdapat data sertifikat yang tidak valid.");
  }

  const ids = validCertificates.map(
    (certificate) => certificate.id
  );

  if (new Set(ids).size !== ids.length) {
    throw new Error("ID sertifikat tidak boleh duplikat.");
  }

  const allCertificates = getAllCertificates();

  const otherCertificates = allCertificates.filter(
    (certificate) => certificate.userId !== userId
  );

  localStorage.setItem(
    CERTIFICATE_KEY,
    JSON.stringify([...otherCertificates, ...validCertificates])
  );
}
