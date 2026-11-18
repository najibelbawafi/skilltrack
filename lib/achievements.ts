
export type StudentAchievement = {
  id: string;
  userId: string;
  title: string;
  category: string;
  organizer: string;
  date: string;
  description: string;
  imageDataUrl: string;
  createdAt: string;
};

const ACHIEVEMENT_KEY = "skilltrack_achievements";

function isStudentAchievement(
  value: unknown
): value is StudentAchievement {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.userId === "string" &&
    typeof item.title === "string" &&
    typeof item.category === "string" &&
    typeof item.organizer === "string" &&
    typeof item.date === "string" &&
    typeof item.description === "string" &&
    typeof item.imageDataUrl === "string" &&
    typeof item.createdAt === "string"
  );
}

function getAllAchievements(): StudentAchievement[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(ACHIEVEMENT_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStudentAchievement);
  } catch {
    return [];
  }
}

export function getStudentAchievements(
  userId: string
): StudentAchievement[] {
  if (!userId) return [];

  return getAllAchievements().filter(
    (achievement) => achievement.userId === userId
  );
}

export function saveStudentAchievements(
  userId: string,
  achievements: StudentAchievement[]
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!userId || !Array.isArray(achievements)) {
    throw new Error("Data pencapaian tidak valid.");
  }

  const validAchievements = achievements.filter(
    (achievement) =>
      isStudentAchievement(achievement) &&
      achievement.userId === userId
  );

  if (validAchievements.length !== achievements.length) {
    throw new Error("Terdapat data pencapaian yang tidak valid.");
  }

  const ids = validAchievements.map((item) => item.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error("ID pencapaian tidak boleh duplikat.");
  }

  const allAchievements = getAllAchievements();

  const otherAchievements = allAchievements.filter(
    (achievement) => achievement.userId !== userId
  );

  localStorage.setItem(
    ACHIEVEMENT_KEY,
    JSON.stringify([...otherAchievements, ...validAchievements])
  );
}
