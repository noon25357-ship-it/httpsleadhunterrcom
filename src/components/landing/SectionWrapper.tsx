import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const SectionWrapper = ({ id, className, children }: SectionWrapperProps) => {
  return (
    <section id={id} className={cn("max-w-5xl mx-auto px-4 py-16 sm:py-24", className)}>
      {children}
    </section>
  );
};

export default SectionWrapper;
