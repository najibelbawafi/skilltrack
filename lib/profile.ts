
export type StudentProfile = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  bio: string;
  major: string;
  school: string;
  startYear: string;
  graduationYear: string;
  photoUrl: string;
  updatedAt: string;
};

const PROFILE_KEY = "skilltrack_profiles";

function isStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== "object") return false;

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.userId === "string" &&
    typeof profile.fullName === "string" &&
    typeof profile.email === "string" &&
    typeof profile.phone === "string" &&
    typeof profile.birthPlace === "string" &&
    typeof profile.birthDate === "string" &&
    typeof profile.gender === "string" &&
    typeof profile.address === "string" &&
    typeof profile.bio === "string" &&
    typeof profile.major === "string" &&
    typeof profile.school === "string" &&
    typeof profile.startYear === "string" &&
    typeof profile.graduationYear === "string" &&
    typeof profile.photoUrl === "string" &&
    typeof profile.updatedAt === "string"
  );
}

function getProfiles(): StudentProfile[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(PROFILE_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStudentProfile);
  } catch {
    return [];
  }
}

export function getStudentProfile(
  userId: string
): StudentProfile | null {
  if (!userId) return null;

  const profiles = getProfiles();

  return (
    profiles.find((profile) => profile.userId === userId) ?? null
  );
}

export function saveStudentProfile(
  profile: StudentProfile
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!isStudentProfile(profile) || !profile.userId.trim()) {
    throw new Error("Data profil tidak valid.");
  }

  const profiles = getProfiles();

  const updatedProfiles = [
    ...profiles.filter((item) => item.userId !== profile.userId),
    profile,
  ];

  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(updatedProfiles)
  );
}
