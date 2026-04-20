import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("ar") ? "ar" : "en";

  const toggle = () => {
    const next = current === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5" />
      {current === "ar" ? "EN" : "AR"}
    </button>
  );
};

export default LanguageToggle;
