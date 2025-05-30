import { useTranslation } from "react-i18next";

const languages = [
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="relative">
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-primary border border-tertiary/20 rounded-md px-3 py-2 text-sm text-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
