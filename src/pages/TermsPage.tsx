import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalLinks } from "@/lib/legal";
import {
  getProfessionalTermsSections,
  professionalTermsLastUpdated,
} from "@/lib/professionalTerms";

const TermsPage = () => {
  const { lang } = useLanguage();
  const legalLinks = getLegalLinks(lang);

  return (
    <LegalPageLayout
      badge={lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
      title={
        lang === "ar"
          ? "الشروط والأحكام المهنية لخدمات العزب"
          : "Professional Terms & Conditions for Alazab Services"
      }
      lead={
        lang === "ar"
          ? "إطار مهني واضح ينظم بدء الأعمال والاعتمادات والدفعات والضمان، ويحدد منهج العزب في أنظمة المراقبة والحماية المدارة مع الحفاظ الكامل على خصوصية العميل."
          : "A clear professional framework covering commencement, approvals, payments, warranty, and Alazab's managed surveillance and security approach while preserving client privacy and control."
      }
      lastUpdated={professionalTermsLastUpdated}
      sections={getProfessionalTermsSections(lang)}
      relatedLinks={legalLinks.filter((link) => link.href !== "/terms")}
    />
  );
};

export default TermsPage;
