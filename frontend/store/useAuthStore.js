import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
        set({ user: data.user, token: data.token });
        return data.user;
      },

      register: async (payload) => {
        const data = await apiFetch('/api/auth/register', { method: 'POST', body: payload });
        set({ user: data.user, token: data.token });
        return data.user;
      },

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => Boolean(get().token),
    }),
    { name: 'uzthermo-auth', skipHydration: true }
  )
);
