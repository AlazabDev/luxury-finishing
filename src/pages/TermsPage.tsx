import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalLinks, getTermsSections, legalLastUpdated } from "@/lib/legal";

const TermsPage = () => {
  const { lang } = useLanguage();
  const legalLinks = getLegalLinks(lang);

  return (
    <LegalPageLayout
      badge={lang === "ar" ? "الشروط والأحكام" : "Terms And Conditions"}
      title={
        lang === "ar"
          ? "شروط استخدام موقع وخدمات لاكشري فينيشينج"
          : "Terms Of Using The Luxury Finishing Website And Services"
      }
      lead={
        lang === "ar"
          ? "تنظم هذه الصفحة أسس استخدام الموقع والقنوات الرقمية والخدمات المرتبطة به، بما في ذلك الشات بوت، طلبات الصيانة، والاتصالات التشغيلية."
          : "This page defines the rules for using the website, connected digital channels, and related services, including the chatbot, maintenance requests, and operational communications."
      }
      lastUpdated={legalLastUpdated}
      sections={getTermsSections(lang)}
      relatedLinks={legalLinks.filter((link) => link.href !== "/terms")}
    />
  );
};

export default TermsPage;
