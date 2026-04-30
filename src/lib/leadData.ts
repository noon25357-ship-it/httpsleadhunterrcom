export interface Lead {
  id: string;
  name: string;
  category: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  phone: string;
  hasWebsite: boolean;
  isActive: boolean;
  score: number;
  label: 'hot' | 'warm' | 'cold';
  mapsUrl: string;
  address?: string;
  websiteUrl?: string;
  insights?: string[];
  socialPresence?: { instagram?: boolean; whatsapp?: boolean; tiktok?: boolean };
  isChain?: boolean;
  goldenOpportunity?: boolean;
}

export interface SearchFilters {
  excludeChains?: boolean;
  onlyNoWebsite?: boolean;
  minRating?: number;
  minReviews?: number;
  maxResults?: number;
  deepSearch?: boolean;
}

export interface SearchStats {
  total: number;
  golden: number;
  noWebsite: number;
  chains: number;
  hot: number;
}

export function calculateScore(lead: Omit<Lead, 'score' | 'label'>): { score: number; label: 'hot' | 'warm' | 'cold' } {
  let score = 0;
  if (!lead.hasWebsite) score += 40;
  if (lead.phone) score += 10;
  if (lead.reviews > 50) score += 20;
  if (lead.rating >= 4) score += 20;
  if (lead.isActive) score += 10;
  const label = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';
  return { score, label };
}

const names: Record<string, string[]> = {
  مطاعم: ['مطعم الديوان', 'مطعم بيت الشاورما', 'مطبخ الوالدة', 'مطعم زمان أول', 'شاورما الريم', 'مطعم الفنر', 'مطبخ ست البيت', 'مطعم بيتزا الملك'],
  كافيهات: ['كافيه المساء', 'قهوة وكتاب', 'كوفي لاونج', 'بن القهوة', 'كافيه الزاوية', 'سيب كوفي', 'كافيه نقطة'],
  صالونات: ['صالون الأناقة', 'صالون جمالك', 'بيوتي لاونج', 'صالون ليالي', 'صالون الجوهرة', 'صالون روز'],
  ورش: ['ورشة الأمان', 'ورشة النجم', 'مركز السرعة', 'ورشة الخليج', 'ورشة المحترف', 'مركز الصيانة الذهبي'],
  عيادات: ['عيادة الابتسامة', 'عيادة الشفاء', 'مركز العناية', 'عيادة صحتك', 'عيادة النور الطبية'],
  عقارات: ['مكتب الديار العقاري', 'عقارات الخليج', 'مكتب النخبة', 'عقارات المستقبل', 'مكتب الأمانة العقاري', 'عقارات الوطن'],
};

const areas: Record<string, string[]> = {
  الرياض: ['العليا', 'النخيل', 'الملقا', 'حي الياسمين', 'السليمانية', 'الروضة', 'المروج'],
  جدة: ['الحمراء', 'الروضة', 'الصفا', 'البوادي', 'الشاطئ', 'النزهة', 'المرجان'],
  الدمام: ['الشاطئ', 'الفيصلية', 'المزروعية', 'الخالدية', 'النخيل'],
};

export function generateMockLeads(city: string, category: string): Lead[] {
  const categoryNames = names[category] || names['مطاعم'];
  const cityAreas = areas[city] || areas['الرياض'];

  return categoryNames.map((name, i) => {
    const rating = +(3.2 + Math.random() * 1.8).toFixed(1);
    const reviews = Math.floor(10 + Math.random() * 200);
    const hasWebsite = Math.random() > 0.8;
    const isActive = Math.random() > 0.15;
    const phone = `05${Math.floor(10000000 + Math.random() * 89999999)}`;
    const area = cityAreas[i % cityAreas.length];

    const base = { id: `lead-${i}`, name, category, area, city, rating, reviews, phone, hasWebsite, isActive, mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + city)}` };
    const { score, label } = calculateScore(base);
    return { ...base, score, label };
  }).sort((a, b) => b.score - a.score);
}

export async function searchRealPlaces(
  city: string,
  category: string,
  filters: SearchFilters = {}
): Promise<{ leads: Lead[]; stats?: SearchStats }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const resp = await fetch(`${supabaseUrl}/functions/v1/search-places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ city, category, filters }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Search failed');
  }

  const data = await resp.json();
  return { leads: data.leads as Lead[], stats: data.stats as SearchStats | undefined };
}

export function getDefaultMessage(service: string, tone: string): string {
  const services: Record<string, string> = {
    website: 'موقع إلكتروني',
    marketing: 'تسويق رقمي',
    social: 'إدارة حسابات السوشال ميديا',
  };
  const svc = services[service] || services.website;

  if (tone === 'formal') {
    return `السلام عليكم ورحمة الله وبركاته\n\nلاحظت أن لديكم نشاط تجاري مميز ولكن لم أجد لكم ${svc} احترافي\n\nيسعدني أن أقدم لكم خدمة ${svc} تساعدكم في استقطاب المزيد من العملاء\n\nهل يمكننا ترتيب موعد لعرض مختصر؟\n\nمع خالص التقدير`;
  }
  return `السلام عليكم\nلاحظت أن عندكم نشاط جميل لكن ما عندكم ${svc}\nأقدر أساعدكم تسوون ${svc} بسيط يجيب لكم عملاء أكثر\nإذا مهتمين نرتب لكم عرض سريع 🚀`;
}

export const cities = ['الرياض', 'جدة', 'الدمام', 'المدينة المنورة', 'مكة', 'الخبر', 'تبوك', 'أبها', 'القصيم', 'حائل', 'الطائف', 'خميس مشيط', 'نجران'];
export const categories = ['مطاعم', 'كافيهات', 'صالونات', 'ورش', 'عيادات', 'عقارات', 'محلات_ملابس', 'صيدليات', 'فنادق', 'مدارس', 'مكتبات', 'جيم', 'مغاسل', 'حلاقة'];
