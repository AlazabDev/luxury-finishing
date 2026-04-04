import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LegalSection, LegalLinkCard } from "@/lib/legal";

interface LegalPageLayoutProps {
  badge: string;
  title: string;
  lead: string;
  lastUpdated: string;
  sections: LegalSection[];
  relatedLinks?: LegalLinkCard[];
}

const LegalPageLayout = ({
  badge,
  title,
  lead,
  lastUpdated,
  sections,
  relatedLinks = [],
}: LegalPageLayoutProps) => {
  const { lang, t } = useLanguage();
  const formattedLastUpdated = new Date(lastUpdated).toLocaleDateString(
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
              "radial-gradient(circle at 20% 20%, rgba(255,185,0,0.25), transparent 35%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.14), transparent 30%)",
          }}
        />
        <div className="container-custom relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
              <FileCheck2 className="h-4 w-4" />
              {badge}
            </div>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-primary-foreground/75">
              {lead}
            </p>
            <div className="mt-6 text-sm text-primary-foreground/60">
              {t("chat.latestUpdate")}: {formattedLastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-border bg-card p-7 shadow-card"
              >
                <h2 className="mb-4 text-2xl font-bold text-primary">{section.title}</h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="leading-8 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-5 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-muted-foreground">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </motion.article>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">
                {lang === "ar" ? "مركز الامتثال" : "Compliance Center"}
              </div>
              <h3 className="mb-3 text-2xl font-bold text-primary">
                {lang === "ar"
                  ? "روابط قانونية جاهزة لمنصات التكامل"
                  : "Ready Legal Links For Integrations"}
              </h3>
              <p className="mb-5 leading-7 text-muted-foreground">
                {lang === "ar"
                  ? "هذه الصفحة جزء من باقة صفحات قانونية وتجهيزية مخصصة للنشر والربط مع القنوات الرسمية والتكاملات الخارجية."
                  : "This page is part of the legal and launch package prepared for official channels and external integrations."}
              </p>
              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link to="/legal">
                  {lang === "ar" ? "افتح المركز القانوني" : "Open Legal Center"}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {relatedLinks.length ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-xl font-bold text-primary">
                  {lang === "ar" ? "روابط مرتبطة" : "Related Links"}
                </h3>
                <div className="space-y-3">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-accent/40 hover:bg-accent/5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-bold text-primary">{link.title}</span>
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
                          {link.badge}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
    <SiteFooter />
    <FloatingElements />
  </div>
  );
};

export default LegalPageLayout;
