
export type StudentProject = {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  year: string;
  link: string;
  createdAt: string;
};

const PROJECT_KEY = "skilltrack_projects";

function isStudentProject(value: unknown): value is StudentProject {
  if (!value || typeof value !== "object") return false;

  const project = value as Record<string, unknown>;

  return (
    typeof project.id === "string" &&
    typeof project.userId === "string" &&
    typeof project.title === "string" &&
    typeof project.category === "string" &&
    typeof project.description === "string" &&
    typeof project.technologies === "string" &&
    typeof project.year === "string" &&
    typeof project.link === "string" &&
    typeof project.createdAt === "string"
  );
}

function getAllProjects(): StudentProject[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(PROJECT_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStudentProject);
  } catch {
    return [];
  }
}

export function getStudentProjects(userId: string): StudentProject[] {
  if (!userId) return [];

  return getAllProjects().filter(
    (project) => project.userId === userId
  );
}

export function saveStudentProjects(
  userId: string,
  studentProjects: StudentProject[]
): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!userId || !Array.isArray(studentProjects)) {
    throw new Error("Data proyek tidak valid.");
  }

  const validProjects = studentProjects.filter(
    (project) =>
      isStudentProject(project) &&
      project.userId === userId
  );

  if (validProjects.length !== studentProjects.length) {
    throw new Error("Terdapat data proyek yang tidak valid.");
  }

  const ids = validProjects.map((project) => project.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error("ID proyek tidak boleh duplikat.");
  }

  const allProjects = getAllProjects();

  const otherProjects = allProjects.filter(
    (project) => project.userId !== userId
  );

  localStorage.setItem(
    PROJECT_KEY,
    JSON.stringify([...otherProjects, ...validProjects])
  );
}
