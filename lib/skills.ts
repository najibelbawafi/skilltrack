export type StudentSkill = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
};

const SKILLS_KEY = "skilltrack_skills";

function getAllSkills(): StudentSkill[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(SKILLS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getStudentSkills(userId: string): StudentSkill[] {
  return getAllSkills().filter((skill) => skill.userId === userId);
}

export function saveStudentSkills(
  userId: string,
  skills: StudentSkill[]
): void {
  if (typeof window === "undefined") return;

  const allSkills = getAllSkills().filter(
    (skill) => skill.userId !== userId
  );

  localStorage.setItem(
    SKILLS_KEY,
    JSON.stringify([...allSkills, ...skills])
  );
}