import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Compass,
  Database,
  ExternalLink,
  FileStack,
  Globe2,
  Images,
  LayoutTemplate,
  Mail,
  MessageCircleMore,
  Network,
  Palette,
  ReceiptText,
  ScrollText,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { Button } from "@/components/ui/button";
import { externalSitemapGroups, internalSitemapGroups, type SitemapIconKey } from "@/lib/sitemap";

const iconMap: Record<SitemapIconKey, typeof Globe2> = {
  home: Compass,
  company: Building2,
  services: Sparkles,
  projects: BriefcaseBusiness,
  blog: ReceiptText,
  contact: MessageCircleMore,
  quote: ReceiptText,
  faq: SearchCheck,
  privacy: ShieldCheck,
  terms: ScrollText,
  cookies: ShieldCheck,
  deletion: ShieldCheck,
  legal: ShieldCheck,
  channels: MessageCircleMore,
  brand: Palette,
  maintenance: Wrench,
  api: Network,
  auth: ShieldCheck,
  erp: BriefcaseBusiness,
  database: Database,
  automation: Settings2,
  chat: MessageCircleMore,
  mail: Mail,
  media: Globe2,
  photos: Images,
  storage: Database,
  files: FileStack,
};

const badgeToneMap: Record<SitemapIconKey, string> = {
  home: "bg-accent/10 text-accent",
  company: "bg-primary/10 text-primary",
  services: "bg-accent/10 text-accent",
  projects: "bg-primary/10 text-primary",
  blog: "bg-secondary text-foreground",
  contact: "bg-secondary text-foreground",
  quote: "bg-accent/10 text-accent",
  faq: "bg-secondary text-foreground",
  privacy: "bg-secondary text-foreground",
  terms: "bg-secondary text-foreground",
  cookies: "bg-secondary text-foreground",
  deletion: "bg-secondary text-foreground",
  legal: "bg-secondary text-foreground",
  channels: "bg-green-500/10 text-green-700",
  brand: "bg-accent/10 text-accent",
  maintenance: "bg-orange-500/10 text-orange-600",
  api: "bg-sky-500/10 text-sky-600",
  auth: "bg-emerald-500/10 text-emerald-600",
  erp: "bg-violet-500/10 text-violet-600",
  database: "bg-cyan-500/10 text-cyan-700",
  automation: "bg-amber-500/10 text-amber-700",
  chat: "bg-green-500/10 text-green-700",
  mail: "bg-rose-500/10 text-rose-700",
  media: "bg-fuchsia-500/10 text-fuchsia-700",
  photos: "bg-pink-500/10 text-pink-700",
  storage: "bg-indigo-500/10 text-indigo-700",
  files: "bg-slate-500/10 text-slate-700",
};

const SitemapPage = () => {
  const internalCount = internalSitemapGroups.reduce((sum, group) => sum + group.items.length, 0);
  const externalCount = externalSitemapGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-primary pt-32 pb-20">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, rgba(255,185,0,0.28), transparent 35%), radial-gradient(circle at 82% 28%, rgba(255,255,255,0.14), transparent 30%)",
            }}
          />
          <div className="container-custom relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                <Compass className="h-4 w-4" />
                خريطة الموقع الاحترافية
              </div>
              <h1 className="mb-5 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
                دليل منظم لصفحات الموقع وروابط شبكة Alazab
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
                مرجع بصري واضح للوصول السريع إلى صفحات موقع Luxury Finishing وإلى
                الروابط الخارجية الخاصة بمنظومة Alazab.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold text-accent">{internalCount}</div>
                <div className="text-sm text-primary-foreground/65">صفحات داخلية</div>
              </div>
              <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold text-accent">{externalCount}</div>
                <div className="text-sm text-primary-foreground/65">روابط خارجية</div>
              </div>
              <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-2 text-3xl font-bold text-accent">{internalSitemapGroups.length + externalSitemapGroups.length}</div>
                <div className="text-sm text-primary-foreground/65">مجموعات منظمة</div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom space-y-16">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-primary">صفحات Luxury Finishing</h2>
                  <p className="text-muted-foreground">المسارات الأساسية داخل الموقع الحالي.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {internalSitemapGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-3xl border border-border bg-card p-7 shadow-card"
                  >
                    <h3 className="mb-2 text-2xl font-bold text-primary">{group.title}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <Link key={item.href} to={item.href} className="group rounded-2xl border border-border/60 bg-background/60 p-4 transition-all hover:border-accent/40 hover:bg-accent/5">
                          <div className="flex items-start justify-between gap-4">
                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${badgeToneMap[item.iconKey]}`}>
                              {(() => {
                                const Icon = iconMap[item.iconKey];
                                return <Icon className="h-5 w-5" />;
                              })()}
                            </div>
                            <div className="mb-1 font-bold text-primary transition-colors group-hover:text-accent">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span>{item.title}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeToneMap[item.iconKey]}`}>
                                  {item.category}
                                </span>
                              </div>
                              <div className="mb-2 text-sm font-normal text-muted-foreground">{item.description}</div>
                              <div className="font-mono text-xs font-normal text-muted-foreground/70">{item.href}</div>
                            </div>
                            <ArrowLeft className="mt-1 h-4 w-4 flex-shrink-0 text-accent transition-transform group-hover:-translate-x-1" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Network className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-primary">شبكة مواقع Alazab</h2>
                  <p className="text-muted-foreground">دليل منظم للمواقع والمنصات المرتبطة بالمجموعة.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {externalSitemapGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-3xl border border-border bg-card p-7 shadow-card"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-2 text-2xl font-bold text-primary">{group.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-accent">
                        <Globe2 className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group rounded-2xl border border-border/60 bg-background/60 p-4 transition-all hover:border-accent/40 hover:bg-accent/5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${badgeToneMap[item.iconKey]}`}>
                              {(() => {
                                const Icon = iconMap[item.iconKey];
                                return <Icon className="h-5 w-5" />;
                              })()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="font-bold text-primary transition-colors group-hover:text-accent">
                                  {item.title}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeToneMap[item.iconKey]}`}>
                                  {item.category}
                                </span>
                              </div>
                              <div className="mb-2 text-sm text-muted-foreground">{item.description}</div>
                              <div className="break-all font-mono text-xs text-muted-foreground/70">{item.href}</div>
                            </div>
                            <ExternalLink className="mt-1 h-4 w-4 flex-shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-[2rem] border border-accent/20 bg-gradient-to-l from-accent/10 via-accent/5 to-transparent p-8"
            >
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <h3 className="mb-2 text-2xl font-bold text-primary">هل تريد توسيع الخريطة إلى دليل مؤسسي كامل؟</h3>
                  <p className="text-muted-foreground">
                    يمكن لاحقاً تطوير هذه الصفحة إلى دليل تشغيلي يضم بيئات العمل،
                    الأنظمة الداخلية، وصلاحيات الوصول حسب نوع المستخدم.
                  </p>
                </div>
                <Button variant="gold" size="lg" asChild>
                  <Link to="/contact">
                    اطلب تنظيم البنية الرقمية
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default SitemapPage;
