import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="font-black text-lg text-foreground tracking-tight">LeadHunter</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            المميزات
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            الأسئلة
          </a>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            تواصل معنا
          </Link>
          <Link
            to="/register"
            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-bold hover:brightness-110 transition-all"
          >
            ابدأ مجانًا
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
