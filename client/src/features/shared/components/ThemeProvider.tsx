import { getItem, setItem } from "@/lib/utils/localStorage";
import { createContext, use, useEffect, useState } from "react";

// Theme type
type theme = "dark" | "light" | "system";

/**
 * ThemeProviderState is the state of the theme provider
 * @property theme - The theme of the app (dark, light, system)
 * @property setTheme - The function to set the theme (dark, light, system)
 */
type themeProviderState = {
  theme: theme;
  setTheme: (theme: theme) => void;
};

// Context for the theme
const ThemeContext = createContext<themeProviderState>({
  theme: "system",
  setTheme: () => {},
});

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: theme;
  storageKey?: string;
};

/**
 * ThemeProvider is a component that provides the theme to the app
 * @param children - The children to render
 * @returns The ThemeProvider component
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "advanced-react-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<theme>(
    getItem(storageKey) ?? defaultTheme,
  );

  // Sync the theme with the system
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("dark", "light");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      setItem(storageKey, systemTheme);
      return;
    }

    root.classList.add(theme);
    setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Provide the theme to the app
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme is a hook that returns the theme and the function to set the theme
 * @returns The theme and the function to set the theme
 * @example
 * const { theme, setTheme } = useTheme();
 */
export const useTheme = () => {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
