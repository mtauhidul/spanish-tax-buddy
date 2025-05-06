import { createContext, useContext } from "react";

export type Language = "es" | "en";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextProps>(
  {} as LanguageContextProps
);

export const useLanguage = () => useContext(LanguageContext);
