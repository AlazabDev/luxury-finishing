import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLegalLinks, getPrivacySections, legalLastUpdated } from "@/lib/legal";

const PrivacyPage = () => {
  const { lang } = useLanguage();
  const legalLinks = getLegalLinks(lang);

  return (
    <LegalPageLayout
      badge={lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
      title={
        lang === "ar"
          ? "سياسة الخصوصية وحوكمة البيانات"
          : "Privacy Policy And Data Governance"
      }
      lead={
        lang === "ar"
          ? "توضح هذه الصفحة طريقة جمع البيانات الشخصية والتقنية واستخدامها ومشاركتها ضمن حدود الخدمة والأمن والامتثال، بما في ذلك القنوات التفاعلية والشات بوت وطلبات الصيانة."
          : "This page explains how personal and technical data is collected, used, and shared within the scope of service delivery, security, and compliance, including interactive channels, the chatbot, and maintenance requests."
      }
      lastUpdated={legalLastUpdated}
      sections={getPrivacySections(lang)}
      relatedLinks={legalLinks.filter((link) => link.href !== "/privacy")}
    />
  );
};

export default PrivacyPage;
