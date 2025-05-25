import { ThemeProviderContext, type ThemeProviderState } from "@/context/ThemeProviderContext";
import { useEffect, useState, type ReactNode } from "react";

// Unified Theme type from feat/ui-rebrand-new-colors-logo
type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    let initial = storedTheme || defaultTheme;
    if (initial === "dark" || initial === "system") {
      initial = "light"; // Always fall back to light
    }
    return initial;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    localStorage.setItem(storageKey, "light");
  }, [storageKey]);

  const value: ThemeProviderState = {
    theme: "light",
    setTheme: (_newTheme: Theme) => {
      localStorage.setItem(storageKey, "light");
      setTheme("light");
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
