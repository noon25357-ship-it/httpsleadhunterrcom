export type PipelineStatus = 'new' | 'offer_generated' | 'contacted' | 'replied' | 'interested' | 'follow_up' | 'closed' | 'not_interested';

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
  opportunityScore: number;
  opportunityReasons: string[];
  pipelineStatus: PipelineStatus;
  notes: string;
  lastContact: string | null;
  nextFollowUp: string | null;
}

export const PIPELINE_STATUSES: Record<PipelineStatus, { label: string; emoji: string; color: string }> = {
  new: { label: 'جديد', emoji: '🆕', color: 'bg-blue-500/20 text-blue-300 border-blue-400/50' },
  offer_generated: { label: 'تم توليد العرض', emoji: '⚡', color: 'bg-purple-500/20 text-purple-300 border-purple-400/50' },
  contacted: { label: 'تم التواصل', emoji: '📤', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' },
  replied: { label: 'رد', emoji: '💬', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' },
  interested: { label: 'مهتم', emoji: '🔥', color: 'bg-orange-500/20 text-orange-300 border-orange-400/50' },
  follow_up: { label: 'متابعة', emoji: '🔄', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50' },
  closed: { label: 'مغلق', emoji: '✅', color: 'bg-primary/20 text-primary border-primary/50' },
  not_interested: { label: 'غير مهتم', emoji: '❌', color: 'bg-destructive/20 text-destructive border-destructive/50' },
};

function calcScore(lead: Omit<SmartLead, 'opportunityScore' | 'opportunityReasons' | 'pipelineStatus' | 'notes' | 'lastContact' | 'nextFollowUp'>): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (lead.websiteStatus === 'no-website') { score += 35; reasons.push('ما عنده موقع إلكتروني'); }
  else if (lead.websiteStatus === 'weak-website') { score += 20; reasons.push('موقعه ضعيف وبطيء'); }

  if (['خدمات', 'عيادات', 'مطاعم'].includes(lead.category)) { score += 15; reasons.push('نشاطه يعتمد على الظهور المحلي'); }

  if (['الرياض', 'جدة', 'مكة', 'الدمام', 'المدينة المنورة'].includes(lead.city)) { score += 10; reasons.push('في مدينة رئيسية'); }

  if (lead.phone) { score += 10; reasons.push('رقم تواصل متوفر'); }

  if (lead.mobileScore !== undefined && lead.mobileScore < 50) { score += 10; reasons.push('تجربة الجوال ضعيفة'); }

  return { score: Math.min(score, 100), reasons };
}

function buildLead(base: Omit<SmartLead, 'opportunityScore' | 'opportunityReasons' | 'pipelineStatus' | 'notes' | 'lastContact' | 'nextFollowUp'>): SmartLead {
  const { score, reasons } = calcScore(base);
  return { ...base, opportunityScore: score, opportunityReasons: reasons, pipelineStatus: 'new', notes: '', lastContact: null, nextFollowUp: null };
}

export const MOCK_SMART_LEADS: SmartLead[] = [
  buildLead({ id: 'sl-1', businessName: 'شركة الصفا للتكييف', city: 'الرياض', category: 'خدمات', websiteStatus: 'no-website', phone: '0551234567' }),
  buildLead({ id: 'sl-2', businessName: 'مؤسسة لمسة الورد', city: 'جدة', category: 'زهور وهدايا', websiteStatus: 'has-website', websiteUrl: 'https://lamsatalward.com', speedScore: 82, mobileScore: 75, phone: '0559876543' }),
  buildLead({ id: 'sl-3', businessName: 'شركة المدار للخدمات', city: 'الدمام', category: 'خدمات', websiteStatus: 'weak-website', websiteUrl: 'https://almadar-services.com', speedScore: 28, mobileScore: 35, phone: '0541112233' }),
  buildLead({ id: 'sl-4', businessName: 'مطاعم المذاق السريع', city: 'مكة', category: 'مطاعم', websiteStatus: 'has-website', websiteUrl: 'https://fast-taste.sa', speedScore: 91, mobileScore: 88, phone: '0563334455' }),
  buildLead({ id: 'sl-5', businessName: 'مركز رؤية البصر', city: 'المدينة المنورة', category: 'عيادات', websiteStatus: 'no-website', phone: '0572225566' }),
  buildLead({ id: 'sl-6', businessName: 'مغسلة النظافة', city: 'الرياض', category: 'خدمات', websiteStatus: 'no-website', phone: '0533445566' }),
  buildLead({ id: 'sl-7', businessName: 'عيادات الشفاء', city: 'جدة', category: 'عيادات', websiteStatus: 'weak-website', websiteUrl: 'https://alshifa-clinic.sa', speedScore: 40, mobileScore: 30, phone: '0544556677' }),
  buildLead({ id: 'sl-8', businessName: 'مطعم بيت الكبسة', city: 'الرياض', category: 'مطاعم', websiteStatus: 'no-website', phone: '0555667788' }),
];
