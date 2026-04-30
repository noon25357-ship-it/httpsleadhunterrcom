import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Globe, Building2, Star, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cities, categories, type SearchFilters } from "@/lib/leadData";

interface SearchPanelProps {
  onSearch: (city: string, category: string, filters: SearchFilters) => void;
  isSearching: boolean;
}

const categoryLabels: Record<string, string> = {
  مطاعم: "مطاعم 🍽️",
  كافيهات: "كافيهات ☕",
  صالونات: "صالونات 💇",
  ورش: "ورش سيارات 🔧",
  عيادات: "عيادات 🏥",
  عقارات: "مكاتب عقارية 🏢",
  محلات_ملابس: "محلات ملابس 👗",
  صيدليات: "صيدليات 💊",
  فنادق: "فنادق 🏨",
  مدارس: "مدارس أهلية 🎓",
  مكتبات: "مكتبات 📚",
  جيم: "نوادي رياضية 🏋️",
  مغاسل: "مغاسل 🚗",
  حلاقة: "حلاقة رجالي ✂️",
};

const SearchPanel = ({ onSearch, isSearching }: SearchPanelProps) => {
  const { t } = useTranslation();
  const [city, setCity] = useState(cities[0]);
  const [category, setCategory] = useState(categories[0]);
  const [showFilters, setShowFilters] = useState(false);

  // Smart filters
  const [excludeChains, setExcludeChains] = useState(true);
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [deepSearch, setDeepSearch] = useState(true);

  const activeFilterCount =
    (excludeChains ? 1 : 0) +
    (onlyNoWebsite ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minReviews > 0 ? 1 : 0) +
    (deepSearch ? 1 : 0);

  const handleSearch = () => {
    onSearch(city, category, {
      excludeChains,
      onlyNoWebsite,
      minRating: minRating || undefined,
      minReviews: minReviews || undefined,
      deepSearch,
      maxResults: 30,
    });
  };

  return (
    <motion.div
      id="search"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="max-w-2xl mx-auto px-4"
    >
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 neon-border">
        {/* Smart badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">بحث ذكي متعدد المصادر</span>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-secondary hover:bg-secondary/70 transition-colors px-3 py-1.5 rounded-lg"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            فلاتر
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t("search.city")}</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{t("search.category")}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            >
              {categories.map((c) => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
            </select>
          </div>
        </div>

        {/* Smart Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4 p-3 sm:p-4 bg-secondary/40 rounded-xl border border-border space-y-3">
                {/* Toggle filters */}
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">بحث عميق (أحياء + استعلامات متعددة)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={deepSearch}
                    onChange={(e) => setDeepSearch(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">استبعاد السلاسل الكبيرة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={excludeChains}
                    onChange={(e) => setExcludeChains(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">بدون موقع فقط (فرص ذهبية)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyNoWebsite}
                    onChange={(e) => setOnlyNoWebsite(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>

                {/* Min rating */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">الحد الأدنى للتقييم</span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {minRating > 0 ? `${minRating}+` : "أي"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Min reviews */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">الحد الأدنى للتقييمات</span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {minReviews > 0 ? `${minReviews}+` : "أي"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={10}
                    value={minReviews}
                    onChange={(e) => setMinReviews(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-primary text-primary-foreground font-bold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          {isSearching ? t("search.searching") : t("search.startSearch")}
        </button>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
