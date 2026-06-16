import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "@/models/user.model";

interface AuthStore {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string; dateOfBirth?: Date; role?: string; marketingConsent?: boolean; smsConsent?: boolean }) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userUpdates: Partial<IUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,

      fetchUser: async () => {
        try {
          const res = await fetch("/api/me", { credentials: "include" });
          const data = await res.json();
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Auth Fetch Error:", error);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      register: async ({ firstName, lastName, email, phone, password, dateOfBirth, role, marketingConsent, smsConsent }) => {
        set({ loading: true });
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, phone, password, dateOfBirth, role, marketingConsent, smsConsent }),
          });

          const data = await res.json();
          if (!res.ok) {
            set({ error: data.error });
            return { success: false, message: data.error || "Registration failed" };
          }

          set({ user: data.user, isAuthenticated: true, error: null });
          return { success: true };
        } catch (error) {
          console.error("Register Error:", error);
          return { success: false, message: "Something went wrong. Please try again." };
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok) {
            set({ error: data.error });
            return { success: false, message: data.error || "Login failed" };
          }

          set({ user: data.user, isAuthenticated: true, error: null });
          return { success: true };
        } catch (error) {
          console.error("Login Error:", error);
          return { success: false, message: "Something went wrong. Please try again." };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        await fetch("/api/auth/logout", { credentials: "include" });
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateUser: (userUpdates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null
        }));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
