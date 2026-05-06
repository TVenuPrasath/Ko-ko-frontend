import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import ta from "./ta.json";
import en from "./en.json";

type Lang = "ta" | "en";
const translations = { ta, en } as const;

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
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("app_lang") as Lang) || "ta"
  );
  const langRef = useRef(lang);

  const setLang = (l: Lang) => {
    langRef.current = l;
    setLangState(l);
    localStorage.setItem("app_lang", l);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[langRef.current] as Record<string, string>;
    const fallback = translations.ta as Record<string, string>;
    return dict[key] || fallback[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
