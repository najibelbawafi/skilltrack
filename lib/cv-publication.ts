
export type CVPublicationSettings = {
  userId: string;
  isPublic: boolean;
  updatedAt: string;
};

const CV_PUBLICATION_KEY = "skilltrack_cv_publication";

function isCVPublicationSettings(
  value: unknown
): value is CVPublicationSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Record<string, unknown>;

  return (
    typeof settings.userId === "string" &&
    typeof settings.isPublic === "boolean" &&
    typeof settings.updatedAt === "string"
  );
}

function getAllSettings(): CVPublicationSettings[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(CV_PUBLICATION_KEY);

    if (!data) {
      return [];
    }

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCVPublicationSettings);
  } catch {
    return [];
  }
}

export function getCVPublicationSettings(
  userId: string
): CVPublicationSettings {
  const defaultSettings: CVPublicationSettings = {
    userId,
    isPublic: false,
    updatedAt: "",
  };

  if (!userId) {
    return defaultSettings;
  }

  const settings = getAllSettings();

  return (
    settings.find((item) => item.userId === userId) ??
    defaultSettings
  );
}

export function saveCVPublicationSettings(
  userId: string,
  isPublic: boolean
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!userId.trim() || typeof isPublic !== "boolean") {
    throw new Error("Pengaturan publikasi CV tidak valid.");
  }

  const settings = getAllSettings();

  const updatedSettings: CVPublicationSettings = {
    userId,
    isPublic,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [
    ...settings.filter((item) => item.userId !== userId),
    updatedSettings,
  ];

  localStorage.setItem(
    CV_PUBLICATION_KEY,
    JSON.stringify(updatedList)
  );

  window.dispatchEvent(
    new Event("skilltrack-cv-publication")
  );
}
