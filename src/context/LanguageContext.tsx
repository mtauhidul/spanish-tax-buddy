// src/context/LanguageContext.tsx
import { LanguageContext, type Language } from "@/hooks/useLanguage";
import { useEffect, useState, type ReactNode } from "react";

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Default to Spanish if browser is set to Spain, otherwise English
  const detectDefaultLanguage = (): Language => {
    const browserLanguage = navigator.language.split("-")[0];

    // Check if user is from Spain by browser language or timezone
    const isSpanishBrowser = browserLanguage === "es";
    const isSpanishTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Madrid";

    return isSpanishBrowser || isSpanishTimezone ? "es" : "en";
  };

  const [language, setLanguage] = useState<Language>(detectDefaultLanguage());

  // Load translations
  const [translations, setTranslations] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >({
    en: {},
    es: {},
  });

  useEffect(() => {
    // Load translations from JSON files
    const loadTranslations = async () => {
      try {
        const enTranslations = await import("@/assets/locales/en.json");
        const esTranslations = await import("@/assets/locales/es.json");

        setTranslations({
          en: enTranslations.default,
          es: esTranslations.default,
        });
      } catch (error) {
        console.error("Error loading translations:", error);
      }
    };

    loadTranslations();

    // Store language preference
    localStorage.setItem("language", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    // Split the key by dots to handle nested objects
    const keys = key.split(".");
    let result = translations[language];

    // Navigate through the nested structure
    for (const k of keys) {
      if (!result || typeof result !== "object") {
        return key; // Return the key if we can't navigate further
      }
      result = result[k];
    }

    // Return the translation or the key if no translation found
    return result || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
