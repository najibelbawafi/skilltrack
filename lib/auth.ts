
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type RegisteredStudent = {
  id: string;
  name: string;
  createdAt: string;
};

const USERS_KEY = "skilltrack_users";
const SESSION_KEY = "skilltrack_current_user";

const USER_DATA_KEYS = [
  "skilltrack_profiles",
  "skilltrack_projects",
  "skilltrack_certificates",
  "skilltrack_achievements",
  "skilltrack_publication",
];

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.passwordHash === "string" &&
    typeof user.createdAt === "string"
  );
}

function getUsers(): User[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(USERS_KEY);

    if (!data) return [];

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isUser);
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === "undefined") {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function removeUserData(key: string, userId: string): void {
  const data = localStorage.getItem(key);

  if (!data) return;

  const parsed: unknown = JSON.parse(data);

  if (!Array.isArray(parsed)) {
    throw new Error(`Format data ${key} tidak valid.`);
  }

  const remainingRecords = parsed.filter((record) => {
    if (!record || typeof record !== "object") {
      throw new Error(`Terdapat data tidak valid pada ${key}.`);
    }

    const item = record as Record<string, unknown>;

    if (typeof item.userId !== "string") {
      throw new Error(`Data pengguna tidak valid pada ${key}.`);
    }

    return item.userId !== userId;
  });

  localStorage.setItem(key, JSON.stringify(remainingRecords));
}

export function getRegisteredStudents(): RegisteredStudent[] {
  return getUsers().map((user) => ({
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  }));
}

async function hashPassword(password: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Fitur keamanan browser tidak tersedia.");
  }

  const encoded = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    return {
      success: false,
      message: "Semua data wajib diisi.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      message: "Password minimal 8 karakter.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      message: "Format email tidak valid.",
    };
  }

  try {
    const users = getUsers();

    const existingUser = users.find(
      (user) => user.email === normalizedEmail
    );

    if (existingUser) {
      return {
        success: false,
        message: "Email sudah terdaftar. Silakan gunakan email lain.",
      };
    }

    const passwordHash = await hashPassword(password);

    const newUser: User = {
      id: crypto.randomUUID(),
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return {
      success: true,
      message: "Pendaftaran berhasil. Silakan login.",
    };
  } catch {
    return {
      success: false,
      message: "Pendaftaran gagal. Silakan coba kembali.",
    };
  }
}

export async function loginUser(
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      message: "Email dan password wajib diisi.",
    };
  }

  try {
    const users = getUsers();

    const user = users.find(
      (item) => item.email === normalizedEmail
    );

    if (!user) {
      return {
        success: false,
        message: "Email belum terdaftar.",
      };
    }

    const passwordHash = await hashPassword(password);

    if (user.passwordHash !== passwordHash) {
      return {
        success: false,
        message: "Password yang kamu masukkan salah.",
      };
    }

    localStorage.setItem(SESSION_KEY, user.id);

    return {
      success: true,
      message: "Login berhasil.",
    };
  } catch {
    return {
      success: false,
      message: "Login gagal. Silakan coba kembali.",
    };
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const userId = localStorage.getItem(SESSION_KEY);

    if (!userId) return null;

    const user = getUsers().find(
      (item) => item.id === userId
    );

    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}

export async function updateUserAccount(
  userId: string,
  name: string,
  email: string,
  currentPassword: string,
  newPassword?: string
) {
  if (!userId || !name.trim() || !email.trim() || !currentPassword) {
    return {
      success: false,
      message: "Semua data wajib diisi.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      message: "Format email tidak valid.",
    };
  }

  if (newPassword && newPassword.length < 8) {
    return {
      success: false,
      message: "Password baru minimal 8 karakter.",
    };
  }

  try {
    const users = getUsers();

    const userIndex = users.findIndex(
      (item) => item.id === userId
    );

    if (userIndex === -1) {
      return {
        success: false,
        message: "Akun tidak ditemukan.",
      };
    }

    const user = users[userIndex];

    const existingEmail = users.find(
      (item) =>
        item.email === normalizedEmail &&
        item.id !== userId
    );

    if (existingEmail) {
      return {
        success: false,
        message: "Email sudah digunakan oleh akun lain.",
      };
    }

    const currentPasswordHash = await hashPassword(currentPassword);

    if (user.passwordHash !== currentPasswordHash) {
      return {
        success: false,
        message: "Password saat ini tidak sesuai.",
      };
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: newPassword
        ? await hashPassword(newPassword)
        : user.passwordHash,
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    return {
      success: true,
      message: "Pengaturan akun berhasil diperbarui.",
    };
  } catch {
    return {
      success: false,
      message: "Pembaruan akun gagal. Silakan coba kembali.",
    };
  }
}

export async function deleteUserAccount(
  userId: string,
  currentPassword: string
) {
  if (!userId || !currentPassword) {
    return {
      success: false,
      message: "Masukkan password untuk mengonfirmasi penghapusan.",
    };
  }

  try {
    const users = getUsers();

    const user = users.find(
      (item) => item.id === userId
    );

    if (!user) {
      return {
        success: false,
        message: "Akun tidak ditemukan.",
      };
    }

    const passwordHash = await hashPassword(currentPassword);

    if (user.passwordHash !== passwordHash) {
      return {
        success: false,
        message: "Password tidak sesuai. Akun tidak dihapus.",
      };
    }

    // Simpan data lama untuk pemulihan jika proses gagal.
    const keys = [...USER_DATA_KEYS, USERS_KEY];
    const previousData = new Map<string, string | null>();

    for (const key of keys) {
      previousData.set(key, localStorage.getItem(key));
    }

    try {
      for (const key of USER_DATA_KEYS) {
        removeUserData(key, userId);
      }

      saveUsers(users.filter((item) => item.id !== userId));

      if (localStorage.getItem(SESSION_KEY) === userId) {
        localStorage.removeItem(SESSION_KEY);
      }

      return {
        success: true,
        message: "Akun dan seluruh data terkait berhasil dihapus.",
      };
    } catch {
      // Pulihkan data jika salah satu proses penghapusan gagal.
      for (const [key, value] of previousData) {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      }

      throw new Error("Penghapusan akun gagal.");
    }
  } catch {
    return {
      success: false,
      message: "Penghapusan data gagal. Silakan coba kembali.",
    };
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
}
