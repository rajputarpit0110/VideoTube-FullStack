import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('videotube-theme') || 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('videotube-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return { theme: newTheme };
  }),
  initTheme: () => {
    const savedTheme = localStorage.getItem('videotube-theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ theme: savedTheme });
  }
}));
