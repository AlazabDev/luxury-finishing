import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Hammer, PaintBucket, Layers, DoorOpen, KeyRound, Headphones, ClipboardCheck, Wrench } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { SERVICE_IMAGE_IDS } from "@/lib/images";
import { getServiceImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const ServicesPage = () => {
  const { t } = useLanguage();

  const mainServices = [
    { icon: Hammer, titleKey: "servicesPage.s1.title", descKey: "servicesPage.s1.desc", imageId: SERVICE_IMAGE_IDS[0] },
    { icon: PaintBucket, titleKey: "servicesPage.s2.title", descKey: "servicesPage.s2.desc", imageId: SERVICE_IMAGE_IDS[1] },
    { icon: Layers, titleKey: "servicesPage.s3.title", descKey: "servicesPage.s3.desc", imageId: SERVICE_IMAGE_IDS[2] },
    { icon: DoorOpen, titleKey: "servicesPage.s4.title", descKey: "servicesPage.s4.desc", imageId: SERVICE_IMAGE_IDS[3] },
    { icon: KeyRound, titleKey: "servicesPage.s5.title", descKey: "servicesPage.s5.desc", imageId: SERVICE_IMAGE_IDS[4] },
  ];

  const extraServices = [
    { icon: Headphones, titleKey: "servicesPage.extra1.title", descKey: "servicesPage.extra1.desc" },
    { icon: ClipboardCheck, titleKey: "servicesPage.extra2.title", descKey: "servicesPage.extra2.desc" },
    { icon: Wrench, titleKey: "servicesPage.extra3.title", descKey: "servicesPage.extra3.desc" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("servicesPage.heroTitle")}
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">{t("servicesPage.heroDesc")}</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom space-y-16">
            {mainServices.map((s, i) => (
              <motion.div key={s.titleKey} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:direction-ltr" : ""}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <s.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-4">{t(s.titleKey)}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
                </div>
                <div className={`rounded-xl overflow-hidden shadow-card ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <LazyImage {...getServiceImage(s.imageId)} alt={t(s.titleKey)} className="w-full h-72 object-cover" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-padding bg-secondary">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-primary text-center mb-12">{t("servicesPage.extraTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {extraServices.map((s, i) => (
                <motion.div key={s.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-8 shadow-card text-center">
                  <s.icon className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-primary mb-3">{t(s.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
                </motion.div>
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

export default ServicesPage;
