import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  variant?: "primary" | "secondary";
  href: string;
  children: React.ReactNode;
  className?: string;
}

const CTAButton = ({ variant = "primary", href, children, className }: CTAButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base transition-all";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:brightness-110",
    secondary: "border border-border text-foreground hover:bg-secondary/60",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Link to={href} className={cn(baseStyles, variants[variant], className)}>
        {children}
      </Link>
    </motion.div>
  );
};

export default CTAButton;
