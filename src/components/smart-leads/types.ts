export interface SmartLead {
  id: string;
  businessName: string;
  city: string;
  category: string;
  websiteStatus: 'no-website' | 'weak-website' | 'has-website';
  websiteUrl?: string;
  speedScore?: number;
  mobileScore?: number;
  phone?: string;
  email?: string;
}

export const MOCK_SMART_LEADS: SmartLead[] = [
  {
    id: 'sl-1',
    businessName: 'شركة الصفا للتكييف',
    city: 'الرياض',
    category: 'خدمات',
    websiteStatus: 'no-website',
    phone: '0551234567',
  },
  {
    id: 'sl-2',
    businessName: 'مؤسسة لمسة الورد',
    city: 'جدة',
    category: 'زهور وهدايا',
    websiteStatus: 'has-website',
    websiteUrl: 'https://lamsatalward.com',
    speedScore: 82,
    mobileScore: 75,
    phone: '0559876543',
  },
  {
    id: 'sl-3',
    businessName: 'شركة المدار للخدمات',
    city: 'الدمام',
    category: 'خدمات',
    websiteStatus: 'weak-website',
    websiteUrl: 'https://almadar-services.com',
    speedScore: 28,
    mobileScore: 35,
    phone: '0541112233',
  },
  {
    id: 'sl-4',
    businessName: 'مطاعم المذاق السريع',
    city: 'مكة',
    category: 'مطاعم',
    websiteStatus: 'has-website',
    websiteUrl: 'https://fast-taste.sa',
    speedScore: 91,
    mobileScore: 88,
    phone: '0563334455',
  },
  {
    id: 'sl-5',
    businessName: 'مركز رؤية البصر',
    city: 'المدينة',
    category: 'عيادات',
    websiteStatus: 'no-website',
    phone: '0572225566',
  },
];
