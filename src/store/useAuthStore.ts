import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_USERS: Record<string, string> = {
  nandan: 'nandan@123$',
  abhishek: 'abhishek@123$',
  sudarshan: 'sudarshan@123$',
};

interface AuthState {
  isAuthenticated: boolean;
  userName: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: null,

      login: (username, password) => {
        const normalizedUsername = username.trim();
        const normalizedPassword = password.trim();
        if (!normalizedUsername || !normalizedPassword) return false;

        const expectedPassword = DEFAULT_USERS[normalizedUsername];
        if (!expectedPassword || expectedPassword !== normalizedPassword) return false;

        set({ isAuthenticated: true, userName: normalizedUsername });
        return true;
      },

      logout: () => set({ isAuthenticated: false, userName: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
