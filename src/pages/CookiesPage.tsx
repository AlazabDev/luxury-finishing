import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCookieSections, getLegalLinks, legalLastUpdated } from "@/lib/legal";

const CookiesPage = () => {
  const { lang } = useLanguage();
  const legalLinks = getLegalLinks(lang);

  return (
    <LegalPageLayout
      badge={lang === "ar" ? "سياسة الكوكيز" : "Cookie Policy"}
      title={
        lang === "ar"
          ? "سياسة ملفات الارتباط والتخزين المحلي"
          : "Cookies And Local Storage Policy"
      }
      lead={
        lang === "ar"
          ? "توضح هذه الصفحة أنواع ملفات الارتباط وتقنيات التخزين المحلية التي قد يستخدمها الموقع لتحسين التشغيل وحفظ التفضيلات ودعم بعض التكاملات."
          : "This page explains the cookies and local storage technologies that may be used to improve operations, preserve preferences, and support selected integrations."
      }
      lastUpdated={legalLastUpdated}
      sections={getCookieSections(lang)}
      relatedLinks={legalLinks.filter((link) => link.href !== "/cookies")}
    />
  );
};

export default CookiesPage;
