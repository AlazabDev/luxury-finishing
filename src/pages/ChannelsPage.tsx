import { motion } from "framer-motion";
import { BadgeCheck, BellRing, Clock3, ExternalLink, Megaphone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import FacebookConnectionCard from "@/components/channels/FacebookConnectionCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSocialChannels, type SocialChannelCard } from "@/lib/legal";

const statusTone: Record<SocialChannelCard["status"], string> = {
  live: "bg-emerald-500/10 text-emerald-700",
  ready: "bg-accent/10 text-accent",
  planned: "bg-secondary text-foreground",
};

const ChannelsPage = () => {
  const { lang } = useLanguage();
  const socialChannels = getSocialChannels(lang);
  const statusLabel: Record<SocialChannelCard["status"], string> =
    lang === "ar"
      ? {
          live: "مباشر",
          ready: "جاهز للربط",
          planned: "قيد الإعداد",
        }
      : {
          live: "Live",
          ready: "Ready To Connect",
          planned: "Planned",
        };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-primary pt-32 pb-20">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 20%, rgba(255,185,0,0.25), transparent 34%), radial-gradient(circle at 82% 22%, rgba(255,255,255,0.14), transparent 28%)",
            }}
          />
          <div className="container-custom relative">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                <Megaphone className="h-4 w-4" />
                {lang === "ar" ? "مركز القنوات الرسمية" : "Official Channels Hub"}
              </div>
              <h1 className="mb-5 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
                {lang === "ar"
                  ? "القنوات الرسمية الحالية والمخطط إطلاقها"
                  : "Current And Planned Official Channels"}
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-primary-foreground/75">
                {lang === "ar"
                  ? "مرجع موحد للقنوات المرتبطة بالمشروع، مع تمييز قناة الإشعارات الرسمية عبر واتساب للأعمال وتجهيز باقي قنوات السوشيال ميديا للنشر المتدرج."
                  : "A unified reference for project channels, highlighting the official WhatsApp Business notification route while preparing the remaining social channels for phased launch."}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom space-y-14">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <BellRing className="h-6 w-6" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-primary">
                  {lang === "ar" ? "قناة الإشعارات النظامية" : "System Notification Channel"}
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {lang === "ar"
                    ? "تم تجهيز الربط الخلفي ليكون واتساب للأعمال هو القناة الأساسية لإشعارات النظام والتحديثات المرتبطة بالطلبات والتكاملات."
                    : "Backend integration is prepared so WhatsApp Business serves as the primary system notifications channel for requests and operational integrations."}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-primary">
                  {lang === "ar" ? "هوية رسمية موحدة" : "Unified Official Identity"}
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {lang === "ar"
                    ? "كل القنوات المستقبلية ستعتمد على نفس النسخة القانونية والهوية الرقمية للمشروع لتقليل التشتت وتسريع الاعتماد."
                    : "All future channels will use the same legal baseline and digital identity to reduce fragmentation and speed up approval."}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Clock3 className="h-6 w-6" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-primary">
                  {lang === "ar" ? "إطلاق تدريجي" : "Phased Launch"}
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {lang === "ar"
                    ? "الصفحات الاجتماعية يمكن نشرها لاحقاً تدريجياً مع بقاء هذه الصفحة مرجعاً ثابتاً للقنوات المعتمدة."
                    : "Social pages can be launched gradually while this page remains the single reference for approved channels."}
                </p>
              </div>
            </div>

            <FacebookConnectionCard />

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {socialChannels.map((channel, index) => (
                <motion.article
                  key={channel.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-3xl border border-border bg-card p-6 shadow-card"
                >
                  <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone[channel.status]}`}>
                    {statusLabel[channel.status]}
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-primary">{channel.title}</h2>
                  <div className="mb-4 font-mono text-sm text-accent">{channel.handle}</div>
                  <p className="mb-4 leading-7 text-muted-foreground">{channel.description}</p>
                  <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    {lang === "ar" ? "الاستخدام الرئيسي" : "Primary use"}: {channel.audience}
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">
                    <ExternalLink className="h-4 w-4 text-accent" />
                    {lang === "ar"
                      ? "سيتم توثيق روابط القنوات هنا فور تفعيلها رسمياً."
                      : "Official channel links will be documented here as soon as they are activated."}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default ChannelsPage;
