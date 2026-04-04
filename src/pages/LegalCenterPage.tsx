import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getComplianceIntegrations,
  getLegalLinks,
  legalLastUpdated,
} from "@/lib/legal";

const LegalCenterPage = () => {
  const { lang, t } = useLanguage();
  const legalLinks = getLegalLinks(lang);
  const complianceIntegrations = getComplianceIntegrations(lang);
  const formattedLastUpdated = new Date(legalLastUpdated).toLocaleDateString(
    lang === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
      <section className="relative overflow-hidden bg-primary pt-32 pb-20">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 18%, rgba(255,185,0,0.26), transparent 34%), radial-gradient(circle at 82% 22%, rgba(255,255,255,0.14), transparent 28%)",
          }}
        />
        <div className="container-custom relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
              <ShieldCheck className="h-4 w-4" />
              {lang === "ar" ? "المركز القانوني والتشغيلي" : "Legal And Operations Center"}
            </div>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
              {lang === "ar"
                ? "صفحات الامتثال المطلوبة للنشر والتكاملات الرسمية"
                : "Compliance Pages Required For Launch And Official Integrations"}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-primary-foreground/75">
              {lang === "ar"
                ? "مرجع موحد لسياسات الموقع والشروط وحذف البيانات وتهيئة القنوات الرسمية بما يناسب متطلبات ميتا وواتساب للأعمال وباقي منصات التكامل."
                : "A unified reference for policies, terms, data deletion, and official channel readiness aligned with Meta, WhatsApp Business, and other integration requirements."}
            </p>
            <div className="mt-6 text-sm text-primary-foreground/60">
              {t("chat.latestUpdate")}: {formattedLastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom space-y-14">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">
                  {lang === "ar" ? "الوثائق القانونية" : "Legal Documents"}
                </h2>
                <p className="text-muted-foreground">
                  {lang === "ar"
                    ? "روابط جاهزة للإدراج في إعدادات التطبيقات والقنوات وصفحات المطورين."
                    : "Ready-to-use links for application settings, channels, and developer pages."}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {legalLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-3xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="mb-3 inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    {link.badge}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-primary">{link.title}</h3>
                    <p className="mb-5 min-h-20 leading-7 text-muted-foreground">{link.description}</p>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link to={link.href}>
                      {lang === "ar" ? "فتح الصفحة" : "Open Page"}
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">
                  {lang === "ar" ? "تغطية التكاملات" : "Integration Coverage"}
                </h2>
                <p className="text-muted-foreground">
                  {lang === "ar"
                    ? "ملخص تشغيلي للحالة الحالية لكل منصة مؤثرة في النشر والامتثال."
                    : "An operational summary of the current readiness of every platform affecting launch and compliance."}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {complianceIntegrations.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-3xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                    {card.status}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-primary">{card.title}</h3>
                  <p className="leading-7 text-muted-foreground">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-accent/20 bg-gradient-to-l from-accent/10 via-accent/5 to-transparent p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h3 className="mb-2 text-2xl font-bold text-primary">
                  {lang === "ar"
                    ? "هل تحتاج مركز القنوات الرسمية أيضاً؟"
                    : "Do You Also Need The Official Channels Hub?"}
                </h3>
                <p className="text-muted-foreground">
                  {lang === "ar"
                    ? "تم تجهيز صفحة مستقلة لتجميع قنوات النشر والسوشيال ميديا وحالة كل قناة تمهيداً للإطلاق الرسمي."
                    : "A dedicated page is ready to collect publishing channels, social media accounts, and the status of each channel before the official launch."}
                </p>
              </div>
              <Button variant="gold" size="lg" asChild>
                <Link to="/channels">
                  {lang === "ar" ? "افتح مركز القنوات" : "Open Channels Hub"}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
    <FloatingElements />
  </div>
  );
};

export default LegalCenterPage;
