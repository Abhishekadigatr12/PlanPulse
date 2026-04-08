import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

// Hardcoded demo credentials – replace with real auth as needed.
const DEMO_USER_ID = 'admin';
const DEMO_PASSWORD = 'password';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isLoggedIn: false,

      login: (userId: string, password: string) => {
        if (userId === DEMO_USER_ID && password === DEMO_PASSWORD) {
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
