# نظام Intent Leads — MVP فعلي

## الهدف
نظام يراقب Reddit و Google Search تلقائياً، يلقط المنشورات اللي فيها نية شراء خدمات رقمية (مواقع، تسويق، تصميم)، يصنفها بالذكاء الاصطناعي، ويولد ردود جاهزة.

---

## المرحلة 1: قاعدة البيانات

### جدول `intent_leads`
- `source` — المنصة (reddit / google)
- `source_url` — رابط المنشور الأصلي
- `author` — اسم الكاتب
- `content` — نص المنشور
- `intent_score` — نقاط النية (0-100) من AI
- `intent_category` — تصنيف (needs_website, needs_marketing, needs_design, needs_seo, other)
- `ai_summary` — ملخص AI للفرصة
- `suggested_reply` — الرد المقترح من AI
- `status` — حالة المتابعة (new, contacted, replied, converted, ignored)
- `user_id` — ربط بالمستخدم

### سياسات الأمان (RLS)
- كل مستخدم يشوف بياناته فقط

---

## المرحلة 2: Edge Functions

### 1. `scan-reddit` — جلب منشورات Reddit
- يبحث في subreddits محددة (r/saudiarabia, r/Entrepreneur, r/smallbusiness, r/web_design)
- كلمات مفتاحية: "need a website", "looking for developer", "أبي موقع", "أحتاج تسويق"
- يستخدم Reddit JSON API (بدون مفتاح — مجاني)

### 2. `scan-google` — بحث Google عبر SerpAPI
- يبحث عن منشورات فيها نية شراء
- أمثلة: `"أحتاج موقع" site:twitter.com`, `"looking for web developer" site:reddit.com`
- يستخدم مفتاح SERPAPI_API_KEY الموجود

### 3. `classify-intent` — تصنيف بالذكاء الاصطناعي
- يستقبل نص المنشور
- يستخدم Lovable AI لتحليل النية وتسجيل النقاط
- يولد ملخص + رد مقترح مخصص
- يحفظ النتائج في قاعدة البيانات

---

## المرحلة 3: واجهة المستخدم

### صفحة `/intent-leads`
- لوحة تعرض كل الـ leads المكتشفة
- فلترة بالمنصة، النقاط، التصنيف، الحالة
- عرض المنشور الأصلي + ملخص AI + الرد المقترح
- أزرار: نسخ الرد، فتح المنشور، تغيير الحالة
- زر "مسح جديد" لتشغيل البحث يدوياً

---

## التقنيات المستخدمة
- **Reddit**: JSON API مجاني (reddit.com/.json)
- **Google**: SerpAPI (مفتاح موجود)
- **AI**: Lovable AI (بدون مفتاح إضافي)
- **Database**: Lovable Cloud (موجود)

## ملاحظات
- لا يحتاج مفاتيح جديدة — كل شي جاهز
- البحث يدوي في البداية (المستخدم يضغط زر)
- ممكن نضيف جدولة تلقائية لاحقاً
