import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    "brand.name": "Luxury Finishing",
    "brand.nameAr": "Luxury Finishing",
    "brand.location": "Cairo, Egypt",

    // Nav
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.services": "Services",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.cta": "Free Consultation",
    "nav.quote": "Get a Quote",
    "nav.legal": "Legal Center",
    "nav.channels": "Official Channels",
    "nav.sitemap": "Sitemap",

    // Hero
    "hero.badge": "Specialists in luxury residential finishing since 2010",
    "hero.slide1.title": "From Foundation to Final Delivery",
    "hero.slide1.subtitle": "Your Dream Home Starts Here",
    "hero.slide2.title": "Interior Designs That Come Alive",
    "hero.slide2.subtitle": "We Turn Your Vision Into Reality",
    "hero.slide3.title": "European Materials, Global Standards",
    "hero.slide3.subtitle": "Quality Without Compromise",
    "hero.slide4.title": "Over 120 Residential Units Completed",
    "hero.slide4.subtitle": "15+ Years of Luxury Finishing Experience",
    "hero.desc": "We design and execute your residential unit finishing with modern designs and European quality — from the first consultation to turnkey delivery.",
    "hero.cta.quote": "Get a Free Quote",
    "hero.cta.work": "View Our Work",

    // Stats
    "stat.years": "Years Experience",
    "stat.units": "Residential Units",
    "stat.designs": "Exclusive Designs",
    "stat.satisfaction": "Client Satisfaction",

    // Services
    "services.badge": "Our Services",
    "services.title": "Integrated Finishing Services",
    "services.desc": "We offer a complete range of luxury residential finishing services with the finest materials and expert craftsmanship.",
    "service.structural": "Structural Modifications",
    "service.structural.desc": "Demolition and reconstruction, hidden electrical wiring, advanced plumbing, central AC installation.",
    "service.finishing": "Architectural Finishing",
    "service.finishing.desc": "Plastering, decorative paints, wallpaper. Premium flooring: parquet, marble, and porcelain.",
    "service.gypsum": "Gypsum & Decor",
    "service.gypsum.desc": "Decorative gypsum board, suspended ceilings, modern lighting distribution, hidden LED lighting.",
    "service.carpentry": "Carpentry & Kitchens",
    "service.carpentry.desc": "Custom kitchen manufacturing, wardrobes, TV units, decorative panels — all made to measure.",
    "service.handover": "Final Handover",
    "service.handover.desc": "Deep cleaning, final inspection, testing all systems, and handing over the keys to you.",

    // Showcase
    "showcase.badge": "Featured Work",
    "showcase.title": "Luxury Residential Finishing Showcases",
    "showcase.desc": "Browse our premium finished residential projects — each reflecting our commitment to quality and elegance.",

    // Expertise
    "expertise.badge": "Why Choose Us",
    "expertise.title": "Expert Craftsmanship & Precision",
    "expertise.desc": "15+ years of experience transforming residential spaces into masterpieces of luxury finishing.",

    // Projects
    "projects.badge": "Our Projects",
    "projects.title": "A Portfolio of Excellence",
    "projects.desc": "Explore our diverse collection of luxury finished residential units.",
    "projects.viewAll": "View All Projects",

    // Timeline
    "timeline.badge": "Our Journey",
    "timeline.title": "From Concept to Completion",
    "timeline.desc": "Our streamlined process ensures a flawless finishing experience.",

    // Testimonials
    "testimonials.badge": "Client Reviews",
    "testimonials.title": "What Our Clients Say",
    "testimonials.desc": "Real feedback from homeowners who trusted us with their dream homes.",

    // CTA
    "cta.title": "Ready to Transform Your Home?",
    "cta.desc": "Get a free consultation and detailed quote for your residential finishing project.",
    "cta.button": "Get Free Quote",
    "cta.call": "Call Us Now",

    // Footer
    "footer.about": "Specialists in finishing and designing luxury residential units with modern designs and European quality.",
    "footer.quickLinks": "Quick Links",
    "footer.services": "Services",
    "footer.contact": "Contact Us",
    "footer.rights": "All rights reserved",
    "footer.privacy": "Privacy Policy",
    "footer.faq": "FAQ",
    "footer.location": "Cairo, Egypt",
    "footer.legal": "Legal Center",
    "footer.channels": "Official Channels",
    "footer.sitemap": "Sitemap",

    // Quote Page
    "quote.badge": "Free Quote",
    "quote.title": "Get a Quote for Your Project",
    "quote.desc": "Complete the form below and our team will contact you with a detailed quote within 24 hours",
    "quote.step1": "Basic Info",
    "quote.step2": "Property Details",
    "quote.step3": "Required Services",
    "quote.step4": "Budget",
    "quote.step5": "Review",
    "quote.name": "Full Name",
    "quote.phone": "Phone Number",
    "quote.email": "Email (optional)",
    "quote.propertyType": "Property Type",
    "quote.area": "Area (m²)",
    "quote.floors": "Number of Floors",
    "quote.location": "Location",
    "quote.budget": "Estimated Budget",
    "quote.notes": "Additional Notes",
    "quote.next": "Next",
    "quote.prev": "Previous",
    "quote.submit": "Submit Request",
    "quote.success.title": "Request Submitted Successfully!",
    "quote.success.desc": "Our team will contact you within 24 hours with a detailed quote.",
    "quote.newRequest": "Submit New Request",

    // Contact
    "contact.title": "Contact Us",
    "contact.desc": "We're here to help with your finishing project",

    // About
    "about.title": "About Luxury Finishing",
    "about.desc": "Learn more about our journey and commitment to excellence",

    // Blog
    "blog.title": "Our Blog",
    "blog.desc": "Tips, trends, and insights about luxury finishing",

    // ChatBot
    "chat.title": "Luxury Finishing Assistant",
    "chat.subtitle": "Maintenance, inquiries, attachments, and voice support",
    "chat.placeholder": "Type your message...",
    "chat.welcome": "Welcome to Luxury Finishing. I can help with general inquiries, create architectural maintenance requests, or check an existing request.",
    "chat.newConversation": "New conversation",
    "chat.history": "Previous conversations",
    "chat.download": "Download transcript",
    "chat.close": "Close chat",
    "chat.open": "Open chat",
    "chat.historyTitle": "Conversation history",
    "chat.historyLead": "You can restore, remove, or clear saved conversations.",
    "chat.historyEmpty": "No saved conversations yet",
    "chat.historyEmptyLead": "History is saved automatically after the first user message.",
    "chat.historyCount": "saved conversations",
    "chat.current": "Current",
    "chat.clearAll": "Clear all",
    "chat.saved": "saved",
    "chat.removeAttachment": "Remove attachment",
    "chat.attach": "Attach files",
    "chat.record": "Voice recording",
    "chat.stopRecord": "Stop recording",
    "chat.listen": "Listen",
    "chat.send": "Send",
    "chat.attachPlaceholder": "Type your message or attach files...",
    "chat.downloadSuccess": "The current conversation transcript was downloaded.",
    "chat.clearSuccess": "Saved conversation history was cleared.",
    "chat.downloadEmpty": "There is no conversation to download right now.",
    "chat.supportLead": "Text and voice chat, maintenance requests, attachments, and previous conversations.",
    "chat.attachmentsAssist": "Integrated assistant for maintenance, inquiries, and attachments",
    "chat.latestUpdate": "Last updated",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",

    // Property types
    "property.apartment": "Apartment",
    "property.villa": "Villa",
    "property.duplex": "Duplex",
    "property.penthouse": "Penthouse",
    "property.townhouse": "Townhouse",
    "property.studio": "Studio",
  },
  ar: {
    // Brand
    "brand.name": "لاكشري فينيشينج",
    "brand.nameAr": "لاكشري فينيشينج",
    "brand.location": "القاهرة، مصر",

    // Nav
    "nav.home": "الرئيسية",
    "nav.about": "عن الشركة",
    "nav.services": "خدماتنا",
    "nav.projects": "مشاريعنا",
    "nav.blog": "المدونة",
    "nav.contact": "اتصل بنا",
    "nav.cta": "استشارة مجانية",
    "nav.quote": "طلب عرض سعر",
    "nav.legal": "المركز القانوني",
    "nav.channels": "القنوات الرسمية",
    "nav.sitemap": "خريطة الموقع",

    // Hero
    "hero.badge": "متخصصون في التشطيبات السكنية الفاخرة منذ 2010",
    "hero.slide1.title": "من التأسيس إلى التسليم النهائي",
    "hero.slide1.subtitle": "بيت العمر يبدأ من هنا",
    "hero.slide2.title": "تصميمات داخلية تنبض بالحياة",
    "hero.slide2.subtitle": "نحوّل رؤيتك إلى واقع ملموس",
    "hero.slide3.title": "خامات أوروبية بمعايير عالمية",
    "hero.slide3.subtitle": "جودة لا تقبل المساومة",
    "hero.slide4.title": "أكثر من 120 وحدة سكنية منفذة",
    "hero.slide4.subtitle": "خبرة 15 عاماً في التشطيبات الفاخرة",
    "hero.desc": "نصمم وننفذ تشطيبات وحدتك السكنية بتصاميم عصرية وجودة أوروبية — من الاستشارة الأولى إلى التسليم على المفتاح.",
    "hero.cta.quote": "اطلب عرض سعر مجاني",
    "hero.cta.work": "شاهد أعمالنا",

    // Stats
    "stat.years": "سنة خبرة",
    "stat.units": "وحدة سكنية",
    "stat.designs": "تصميم حصري",
    "stat.satisfaction": "رضا العملاء",

    // Services
    "services.badge": "خدماتنا",
    "services.title": "خدمات تشطيب متكاملة",
    "services.desc": "نقدم باقة شاملة من خدمات تشطيب الوحدات السكنية الفاخرة بأجود الخامات وأمهر الحرفيين.",
    "service.structural": "التعديلات الإنشائية",
    "service.structural.desc": "هدم وإعادة بناء الجدران، تمديدات كهربائية مخفية، شبكات سباكة متطورة، تأسيس أنظمة تكييف مركزي.",
    "service.finishing": "التشطيبات المعمارية",
    "service.finishing.desc": "لياسة، دهانات ديكورية، ورق جدران. أرضيات راقية من باركيه، رخام، وبورسلين.",
    "service.gypsum": "أعمال الجبس والديكور",
    "service.gypsum.desc": "ألواح جبس بورد ديكورية، أسقف معلقة، توزيع إضاءة حديث، لد مخفي.",
    "service.carpentry": "النجارة والمطابخ",
    "service.carpentry.desc": "تصنيع مطابخ خشبية حسب المقاس، دواليب ملابس، وحدات تلفزيون، بانوهات ديكورية.",
    "service.handover": "التسليم النهائي",
    "service.handover.desc": "تنظيف شامل عميق، فحص نهائي، اختبار جميع الأنظمة، وتسليم المفتاح.",

    // Showcase
    "showcase.badge": "أعمال مميزة",
    "showcase.title": "نماذج تشطيب وحدات سكنية فاخرة",
    "showcase.desc": "تصفح مشاريعنا المنفذة — كل مشروع يعكس التزامنا بالجودة والأناقة.",

    // Expertise
    "expertise.badge": "لماذا نحن",
    "expertise.title": "حرفية وتميز في التنفيذ",
    "expertise.desc": "أكثر من 15 عاماً من الخبرة في تحويل الوحدات السكنية إلى تحف في التشطيبات الفاخرة.",

    // Projects
    "projects.badge": "مشاريعنا",
    "projects.title": "معرض أعمال متميز",
    "projects.desc": "تصفح مجموعتنا المتنوعة من الوحدات السكنية الفاخرة.",
    "projects.viewAll": "عرض جميع المشاريع",

    // Timeline
    "timeline.badge": "رحلتنا",
    "timeline.title": "من الفكرة إلى الإنجاز",
    "timeline.desc": "عمليتنا المنظمة تضمن تجربة تشطيب سلسة.",

    // Testimonials
    "testimonials.badge": "آراء العملاء",
    "testimonials.title": "ماذا يقول عملاؤنا",
    "testimonials.desc": "تقييمات حقيقية من أصحاب منازل وثقوا بنا لتحقيق حلمهم.",

    // CTA
    "cta.title": "مستعد لتحويل منزلك؟",
    "cta.desc": "احصل على استشارة مجانية وعرض سعر تفصيلي لمشروع تشطيب وحدتك السكنية.",
    "cta.button": "احصل على عرض سعر مجاني",
    "cta.call": "اتصل بنا الآن",

    // Footer
    "footer.about": "متخصصون في تشطيب وتصميم الوحدات السكنية الفاخرة بتصاميم عصرية وجودة أوروبية.",
    "footer.quickLinks": "روابط سريعة",
    "footer.services": "الخدمات",
    "footer.contact": "تواصل معنا",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.privacy": "سياسة الخصوصية",
    "footer.faq": "الأسئلة الشائعة",
    "footer.location": "القاهرة، مصر",
    "footer.legal": "المركز القانوني",
    "footer.channels": "القنوات الرسمية",
    "footer.sitemap": "خريطة الموقع",

    // Quote Page
    "quote.badge": "عرض سعر مجاني",
    "quote.title": "احصل على عرض سعر لمشروعك",
    "quote.desc": "أكمل النموذج التالي وسيتواصل معك فريقنا بعرض سعر تفصيلي خلال 24 ساعة",
    "quote.step1": "معلومات أساسية",
    "quote.step2": "تفاصيل العقار",
    "quote.step3": "الخدمات المطلوبة",
    "quote.step4": "الميزانية",
    "quote.step5": "المراجعة",
    "quote.name": "الاسم الكامل",
    "quote.phone": "رقم الهاتف",
    "quote.email": "البريد الإلكتروني (اختياري)",
    "quote.propertyType": "نوع العقار",
    "quote.area": "المساحة (م²)",
    "quote.floors": "عدد الطوابق",
    "quote.location": "الموقع",
    "quote.budget": "الميزانية التقديرية",
    "quote.notes": "ملاحظات إضافية",
    "quote.next": "التالي",
    "quote.prev": "السابق",
    "quote.submit": "إرسال الطلب",
    "quote.success.title": "تم إرسال طلبك بنجاح!",
    "quote.success.desc": "سيتواصل معك فريقنا خلال 24 ساعة لتقديم عرض السعر التفصيلي.",
    "quote.newRequest": "تقديم طلب جديد",

    // Contact
    "contact.title": "اتصل بنا",
    "contact.desc": "نحن هنا لمساعدتك في مشروع التشطيب",

    // About
    "about.title": "عن لاكشري فينيشينج",
    "about.desc": "تعرف على رحلتنا والتزامنا بالتميز",

    // Blog
    "blog.title": "المدونة",
    "blog.desc": "نصائح واتجاهات ومعلومات عن التشطيبات الفاخرة",

    // ChatBot
    "chat.title": "مساعد لاكشري فينيشينج",
    "chat.subtitle": "الصيانة والاستفسارات والمرفقات والدعم الصوتي",
    "chat.placeholder": "اكتب رسالتك...",
    "chat.welcome": "مرحباً بك في لاكشري فينيشينج. يمكنني مساعدتك في الاستفسارات العامة، أو إنشاء طلب صيانة معمارية، أو الاستعلام عن طلب قائم.",
    "chat.newConversation": "محادثة جديدة",
    "chat.history": "المحادثات السابقة",
    "chat.download": "تنزيل نسخة من المحادثة",
    "chat.close": "إغلاق المحادثة",
    "chat.open": "فتح المحادثة",
    "chat.historyTitle": "سجل المحادثات",
    "chat.historyLead": "يمكنك الرجوع إلى أي محادثة سابقة أو حذفها أو بدء محادثة جديدة.",
    "chat.historyEmpty": "لا توجد محادثات محفوظة بعد",
    "chat.historyEmptyLead": "يبدأ السجل بالحفظ تلقائياً بعد أول رسالة من المستخدم.",
    "chat.historyCount": "محادثة محفوظة",
    "chat.current": "الحالية",
    "chat.clearAll": "مسح الكل",
    "chat.saved": "محفوظة",
    "chat.removeAttachment": "إزالة المرفق",
    "chat.attach": "إرفاق ملفات",
    "chat.record": "تسجيل صوتي",
    "chat.stopRecord": "إيقاف التسجيل",
    "chat.listen": "استمع",
    "chat.send": "إرسال",
    "chat.attachPlaceholder": "اكتب رسالتك أو أرفق ملفات...",
    "chat.downloadSuccess": "تم تنزيل نسخة من المحادثة الحالية.",
    "chat.clearSuccess": "تم مسح سجل المحادثات المحفوظة.",
    "chat.downloadEmpty": "لا توجد محادثة قابلة للتنزيل حالياً.",
    "chat.supportLead": "دعم المحادثة النصية والصوتية، إنشاء طلبات الصيانة، المرفقات، وسجل المحادثات السابقة.",
    "chat.attachmentsAssist": "مساعد متكامل للصيانة والاستفسارات والمرفقات",
    "chat.latestUpdate": "آخر تحديث",

    // Theme
    "theme.light": "نهاري",
    "theme.dark": "ليلي",

    // Property types
    "property.apartment": "شقة",
    "property.villa": "فيلا",
    "property.duplex": "دوبلكس",
    "property.penthouse": "بنتهاوس",
    "property.townhouse": "تاون هاوس",
    "property.studio": "استوديو",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("lf-lang");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lf-lang", newLang);
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  const t = (key: string): string => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}
