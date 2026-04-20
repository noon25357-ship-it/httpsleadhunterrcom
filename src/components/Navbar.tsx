import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const Navbar = () => {
  const { t } = useTranslation();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="font-black text-lg text-foreground tracking-tight">LeadHunter</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle />
          <ThemeToggle />
          <a href="#search" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            {t("nav.home")}
          </a>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            {t("nav.contact")}
          </Link>
          <a
            href="/register"
            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-bold hover:brightness-110 transition-all"
          >
            {t("nav.startFree")}
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
