import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "doctor" | "geneticist" | "pharmacist" | "nurse" | "viewer";
}

interface AuthStore {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    id: "u-101",
    email: "dr.rachel.kim@precisionrx.ai",
    fullName: "Dr. Rachel Kim",
    role: "doctor",
  },
  accessToken: "mock-jwt-token-precisionrx",
  isAuthenticated: true,
  login: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
