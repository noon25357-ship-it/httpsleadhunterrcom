import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import SearchPanel from "@/components/SearchPanel";
import LeadCard from "@/components/LeadCard";
import ContactModal from "@/components/ContactModal";
import TopAction from "@/components/TopAction";
import EmailCapture from "@/components/EmailCapture";
import ScanningOverlay from "@/components/ScanningOverlay";
import { generateMockLeads, type Lead } from "@/lib/leadData";

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleSearch = useCallback((city: string, category: string) => {
    setIsSearching(true);
    setLeads([]);
    setHasSearched(false);

    setTimeout(() => {
      const results = generateMockLeads(city, category);
      setLeads(results);
      setIsSearching(false);
      setHasSearched(true);
      setSearchCount((c) => c + 1);
    }, 1800);
  }, []);

  const showEmailCapture = searchCount >= 2 && hasSearched;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="relative -mt-12 z-20 pb-20">
        <SearchPanel onSearch={handleSearch} isSearching={isSearching} />

        <div className="max-w-5xl mx-auto px-4 mt-10">
          <AnimatePresence mode="wait">
            {isSearching && <ScanningOverlay key="scan" />}
          </AnimatePresence>

          {hasSearched && !isSearching && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground mb-8 text-lg"
              >
                لقينا لك <span className="neon-text font-bold">{leads.length}</span> فرصة
              </motion.p>

              <TopAction leads={leads} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead, i) => (
                  <LeadCard key={lead.id} lead={lead} index={i} onContact={setSelectedLead} />
                ))}
              </div>

              {showEmailCapture && (
                <div className="mt-12">
                  <EmailCapture />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ContactModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};

export default Index;
