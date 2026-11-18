
export type PublicationSettings = {
  userId: string;
  isPublic: boolean;
  updatedAt: string;
};

const PUBLICATION_KEY = "skilltrack_publication";

function isPublicationSettings(
  value: unknown
): value is PublicationSettings {
  if (!value || typeof value !== "object") return false;

  const settings = value as Record<string, unknown>;

  return (
    typeof settings.userId === "string" &&
    typeof settings.isPublic === "boolean" &&
    typeof settings.updatedAt === "string"
  );
}

function getAllSettings(): PublicationSettings[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(PUBLICATION_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isPublicationSettings);
  } catch {
    return [];
  }
}

export function getPublicationSettings(
  userId: string
): PublicationSettings {
  const defaultSettings: PublicationSettings = {
    userId,
    isPublic: false,
    updatedAt: "",
  };

  if (!userId) return defaultSettings;

  const settings = getAllSettings();

  const existing = settings.find(
    (item) => item.userId === userId
  );

  return existing ?? defaultSettings;
}

export function savePublicationSettings(
  userId: string,
  isPublic: boolean
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!userId.trim() || typeof isPublic !== "boolean") {
    throw new Error("Pengaturan publikasi tidak valid.");
  }

  const settings = getAllSettings();

  const updatedSettings: PublicationSettings = {
    userId,
    isPublic,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [
    ...settings.filter((item) => item.userId !== userId),
    updatedSettings,
  ];

  localStorage.setItem(
    PUBLICATION_KEY,
    JSON.stringify(updatedList)
  );
}
