import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchPanel from "@/components/SearchPanel";
import LeadCard from "@/components/LeadCard";
import ContactModal from "@/components/ContactModal";
import TopAction from "@/components/TopAction";
import EmailCapture from "@/components/EmailCapture";
import ScanningOverlay from "@/components/ScanningOverlay";
import LandingSections from "@/components/LandingSections";
import PipelineSection from "@/components/PipelineSection";
import SmartLeadsDashboard from "@/components/smart-leads/SmartLeadsDashboard";
import { generateMockLeads, type Lead } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";

const CountUp = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 15));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 60);
    ref.current = interval as unknown as number;
    return () => clearInterval(ref.current);
  }, [target]);

  return <span>{count}</span>;
};

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
    trackEvent("search", { city, category });

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
      <Navbar />
      <HeroSection />

      <div className="relative z-20 pb-20">
        <div className="-mt-12">
          <SearchPanel onSearch={handleSearch} isSearching={isSearching} />
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-10">
          <AnimatePresence mode="wait">
            {isSearching && <ScanningOverlay key="scan" />}
          </AnimatePresence>

          {hasSearched && !isSearching && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-8"
              >
                <p className="text-lg text-foreground font-bold">
                  👉 لقينا لك <span className="neon-text text-2xl"><CountUp target={leads.length} /></span> فرص جاهزة للبيع الآن
                </p>
                <p className="text-sm text-muted-foreground mt-1">ابدأ بأفضلها (Hot) أولًا</p>
              </motion.div>

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

      {/* Smart Leads AI Section */}
      <SmartLeadsDashboard />

      {/* Pipeline CRM section */}
      <PipelineSection />

      {/* Landing page sections */}
      <LandingSections />

      <ContactModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};

export default Index;
