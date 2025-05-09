import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/colors";

export type ThemeType = "light" | "dark";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface SettingsState {
  currency: Currency;
  theme: ThemeType;
  notifications: boolean;
  colors: typeof colors;
  updateCurrency: (currency: Currency) => void;
  updateTheme: (theme: ThemeType) => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
      },
      theme: "light",
      notifications: true,
      colors: colors,
      
      updateCurrency: (currency: Currency) => {
        set({ currency });
      },
      
      updateTheme: (theme: ThemeType) => {
        set({ 
          theme,
          colors: theme === "dark" ? colors : colors
        });
      },
      
      toggleNotifications: () => {
        set((state) => ({ notifications: !state.notifications }));
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);