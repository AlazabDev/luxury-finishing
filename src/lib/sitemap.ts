export interface SitemapLinkItem {
  title: string;
  href: string;
  description: string;
  category: string;
  iconKey: SitemapIconKey;
}

export interface SitemapGroup {
  id: string;
  title: string;
  description: string;
  items: SitemapLinkItem[];
}

export type SitemapIconKey =
  | "home"
  | "company"
  | "services"
  | "projects"
  | "blog"
  | "contact"
  | "quote"
  | "faq"
  | "privacy"
  | "terms"
  | "cookies"
  | "deletion"
  | "legal"
  | "channels"
  | "brand"
  | "maintenance"
  | "api"
  | "auth"
  | "erp"
  | "database"
  | "automation"
  | "chat"
  | "mail"
  | "media"
  | "photos"
  | "storage"
  | "files";

export const internalSitemapGroups: SitemapGroup[] = [
  {
    id: "main",
    title: "الصفحات الرئيسية",
    description: "المسارات الأساسية داخل موقع Luxury Finishing.",
    items: [
      { title: "الرئيسية", href: "/", description: "بوابة الموقع الرئيسية.", category: "واجهة الموقع", iconKey: "home" },
      { title: "من نحن", href: "/about", description: "تعريف بالشركة وفريقها.", category: "تعريف مؤسسي", iconKey: "company" },
      { title: "الخدمات", href: "/services", description: "تفاصيل الخدمات الرئيسية.", category: "الخدمات", iconKey: "services" },
      { title: "المشاريع", href: "/projects", description: "معرض الأعمال والمشروعات.", category: "الأعمال", iconKey: "projects" },
      { title: "المدونة", href: "/blog", description: "محتوى ومقالات متخصصة.", category: "المحتوى", iconKey: "blog" },
      { title: "تواصل معنا", href: "/contact", description: "طرق التواصل والاستفسار.", category: "التواصل", iconKey: "contact" },
    ],
  },
  {
    id: "support",
    title: "صفحات الدعم",
    description: "مسارات مساندة لدعم التحويل وخدمة الزائر.",
    items: [
      { title: "طلب عرض سعر", href: "/quote", description: "إرسال طلب تسعير مخصص.", category: "التحويل", iconKey: "quote" },
      { title: "الأسئلة الشائعة", href: "/faq", description: "إجابات عن أكثر الأسئلة تكراراً.", category: "الدعم", iconKey: "faq" },
      { title: "سياسة الخصوصية", href: "/privacy", description: "سياسات الخصوصية والبيانات.", category: "السياسات", iconKey: "privacy" },
      { title: "المركز القانوني", href: "/legal", description: "مرجع السياسات والامتثال.", category: "السياسات", iconKey: "legal" },
      { title: "الشروط والأحكام", href: "/terms", description: "شروط استخدام الموقع والخدمات.", category: "السياسات", iconKey: "terms" },
      { title: "سياسة الكوكيز", href: "/cookies", description: "الكوكيز والتخزين المحلي.", category: "السياسات", iconKey: "cookies" },
      { title: "حذف البيانات", href: "/data-deletion", description: "قناة طلب حذف البيانات.", category: "الامتثال", iconKey: "deletion" },
      { title: "القنوات الرسمية", href: "/channels", description: "مركز السوشيال ميديا والقنوات الرسمية.", category: "القنوات", iconKey: "channels" },
    ],
  },
];

export const externalSitemapGroups: SitemapGroup[] = [
  {
    id: "brand",
    title: "الهوية والمنصات الرئيسية",
    description: "المواقع العامة والأساسية ضمن منظومة Alazab.",
    items: [
      { title: "alazab.com", href: "https://alazab.com", description: "الموقع الرئيسي للمجموعة.", category: "موقع رئيسي", iconKey: "brand" },
      { title: "luxury-finishing.alazab.com", href: "https://luxury-finishing.alazab.com", description: "منصة Luxury Finishing.", category: "تشطيبات فاخرة", iconKey: "services" },
      { title: "brand-identity.alazab.com", href: "https://brand-identity.alazab.com", description: "منصة الهوية والعلامة التجارية.", category: "هوية بصرية", iconKey: "brand" },
      { title: "uberfix.alazab.com", href: "https://uberfix.alazab.com", description: "منصة خدمات الصيانة.", category: "الصيانة", iconKey: "maintenance" },
      { title: "uberfix-landing.alazab.com", href: "https://uberfix-landing.alazab.com", description: "الصفحة التعريفية لـ Uberfix.", category: "صفحة هبوط", iconKey: "maintenance" },
      { title: "laban-alasfour.alazab.com", href: "https://laban-alasfour.alazab.com", description: "منصة المشروع أو العلامة الفرعية.", category: "علامة فرعية", iconKey: "brand" },
    ],
  },
  {
    id: "systems",
    title: "الأنظمة والتكاملات",
    description: "روابط الأنظمة الخلفية والمنصات التشغيلية.",
    items: [
      { title: "api.alazab.com", href: "https://api.alazab.com", description: "واجهات وخدمات التكامل البرمجي.", category: "API", iconKey: "api" },
      { title: "auth.alazab.com", href: "https://auth.alazab.com", description: "المصادقة وإدارة الدخول.", category: "مصادقة", iconKey: "auth" },
      { title: "erp.alazab.com", href: "https://erp.alazab.com", description: "نظام إدارة الموارد والأعمال.", category: "ERP", iconKey: "erp" },
      { title: "supabase.alazab.com", href: "https://supabase.alazab.com", description: "الخدمات الخلفية وقواعد البيانات.", category: "قاعدة بيانات", iconKey: "database" },
      { title: "n8n.alazab.com", href: "https://n8n.alazab.com", description: "الأتمتة وسير العمل.", category: "أتمتة", iconKey: "automation" },
      { title: "whatsapp.alazab.com", href: "https://whatsapp.alazab.com", description: "تكاملات المحادثة وواتساب.", category: "محادثات", iconKey: "chat" },
    ],
  },
  {
    id: "assets",
    title: "الوسائط والتخزين",
    description: "خدمات المحتوى الرقمي والملفات والتواصل.",
    items: [
      { title: "mail.alazab.com", href: "https://mail.alazab.com", description: "البريد الإلكتروني.", category: "بريد", iconKey: "mail" },
      { title: "media.alazab.com", href: "https://media.alazab.com", description: "إدارة الوسائط والمحتوى.", category: "وسائط", iconKey: "media" },
      { title: "photos.alazab.com", href: "https://photos.alazab.com", description: "معرض الصور والألبومات.", category: "صور", iconKey: "photos" },
      { title: "storage.alazab.com", href: "https://storage.alazab.com", description: "مساحات التخزين السحابي.", category: "تخزين", iconKey: "storage" },
      { title: "seafile.alazab.com", href: "https://seafile.alazab.com", description: "أرشفة ومشاركة الملفات.", category: "ملفات", iconKey: "files" },
    ],
  },
];
