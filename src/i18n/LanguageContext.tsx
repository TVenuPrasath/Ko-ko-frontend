import React, { createContext, useContext } from "react";
import ta from "./ta.json";

type Lang = "ta";
const translations = { ta } as const;

type TranslationKey = keyof typeof ta;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ta",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const lang: Lang = "ta";

  const t = (key: TranslationKey): string => {
    return translations.ta[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
