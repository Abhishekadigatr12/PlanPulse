import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isLoggedIn: false,

      login: (userId: string, password: string) => {
        const validUserId = import.meta.env.VITE_DEMO_USER_ID ?? 'admin';
        const validPassword = import.meta.env.VITE_DEMO_PASSWORD ?? 'password';
        if (userId === validUserId && password === validPassword) {
          set({ userId, isLoggedIn: true });
          return true;
        }
        return false;
      },

      logout: () => set({ userId: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
