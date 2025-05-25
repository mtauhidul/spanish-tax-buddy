import { ThemeProviderContext, type ThemeProviderState } from "@/context/ThemeProviderContext"; // Assuming ThemeProviderState is exported or use ThemeProviderContext directly
import { useEffect, useState, type ReactNode } from "react";

// This Theme type must match the one in ThemeProviderContext.tsx
type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme; // Use the broader Theme type
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system", // Default to system, which will resolve to light
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    // If stored theme is "dark", or if default is "dark" and no stored theme, set to "light".
    // System theme will be handled by useEffect to default to light.
    let initial = storedTheme || defaultTheme;
    if (initial === "dark") {
      initial = "light";
    }
    return initial;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    // If theme state was 'system', actual applied theme is 'light'.
    // Update stored theme to 'light' to reflect reality.
    if (localStorage.getItem(storageKey) !== "light") {
        localStorage.setItem(storageKey, "light");
    }
  }, [theme, storageKey]); // theme state change triggers this, ensures consistency

  const value: ThemeProviderState = { // Ensure this matches the imported type
    theme: "light", // We always report "light" as the current theme now.
    setTheme: (newThemeCallbackParam: Theme) => { // Parameter name must match for assignability if type checking is strict that way, but usually it's by type. Let's use a distinct name.
      // Regardless of what is passed, we set to "light".
      localStorage.setItem(storageKey, "light");
      setTheme("light"); // Update the internal state to "light".
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
