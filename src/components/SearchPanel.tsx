import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cities, categories } from "@/lib/leadData";

interface SearchPanelProps {
  onSearch: (city: string, category: string) => void;
  isSearching: boolean;
}

const SearchPanel = ({ onSearch, isSearching }: SearchPanelProps) => {
  const [city, setCity] = useState(cities[0]);
  const [category, setCategory] = useState(categories[0]);

  return (
    <motion.div
      id="search"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="max-w-2xl mx-auto px-4"
    >
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 neon-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">المدينة</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">التصنيف</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => onSearch(city, category)}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-primary text-primary-foreground font-bold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          {isSearching ? "جاري البحث..." : "👉 ابدأ البحث الآن"}
        </button>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
