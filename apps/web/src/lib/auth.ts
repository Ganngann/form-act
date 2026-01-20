import { API_URL } from "./config";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  formateur?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const auth = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
};
