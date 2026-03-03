import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("access_token", token);
                }
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
