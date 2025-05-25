import { ThemeProviderContext } from "@/context/ThemeProviderContext";
import { useEffect, useState, type ReactNode } from "react";

type Theme = "light";

// src/components/ThemeProvider.tsx
type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    localStorage.setItem(storageKey, "light"); // Persist that only light is active
  }, [storageKey]); // theme can be removed from dependencies as it's always light

  const value = {
    theme: "light" as Theme, // Cast as Theme to satisfy type, actual is string "light"
    setTheme: (newTheme: Theme) => { // newTheme will always be "light" due to type
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
