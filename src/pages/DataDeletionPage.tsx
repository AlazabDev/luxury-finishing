import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDataDeletionSections, getLegalLinks, legalLastUpdated } from "@/lib/legal";

const DataDeletionPage = () => {
  const { lang } = useLanguage();
  const legalLinks = getLegalLinks(lang);

  return (
    <LegalPageLayout
      badge={lang === "ar" ? "حذف البيانات" : "Data Deletion"}
      title={
        lang === "ar"
          ? "تعليمات طلب حذف البيانات وتقليلها"
          : "Data Deletion And Reduction Instructions"
      }
      lead={
        lang === "ar"
          ? "هذه الصفحة مرجعية للمستخدمين ولمتطلبات المنصات الخارجية مثل ميتا عند الحاجة إلى قناة عامة موثقة لطلبات حذف البيانات أو تقليلها."
          : "This page serves as the public reference for users and external platforms such as Meta when a documented route for data deletion or reduction is required."
      }
      lastUpdated={legalLastUpdated}
      sections={getDataDeletionSections(lang)}
      relatedLinks={legalLinks.filter((link) => link.href !== "/data-deletion")}
    />
  );
};

export default DataDeletionPage;
