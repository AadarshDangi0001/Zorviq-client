const TOKEN_KEY = "token";
const USER_KEY = "zorviq_user";

export type StoredUser = {
  _id: string;
  email: string;
  fullname: string;
  contact?: string;
  verified?: boolean;
};

export const authToken = {
  get() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token?: string, user?: StoredUser) {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  },
};
