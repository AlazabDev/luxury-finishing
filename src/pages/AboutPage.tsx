import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Shield, Award, Users } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { ABOUT_IMAGE_IDS } from "@/lib/images";
import { getEditorialImage, getPortraitImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Award, label: t("about.quality") },
    { icon: Shield, label: t("about.commitment") },
    { icon: Target, label: t("about.innovation") },
    { icon: Eye, label: t("about.transparency") },
  ];

  const stats = [
    { value: "15", label: t("about.yearsExp") },
    { value: "120", label: t("about.projectsDone") },
    { value: "50", label: t("about.repeatClients") },
  ];

  const team = [
    { name: "م. أحمد العزب", role: t("about.ceo"), imageId: ABOUT_IMAGE_IDS[1] },
    { name: "م. محمد حسن", role: t("about.projectMgr"), imageId: ABOUT_IMAGE_IDS[2] },
    { name: "م. سارة إبراهيم", role: t("about.designMgr"), imageId: ABOUT_IMAGE_IDS[0] },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("about.heroTitle")}
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">{t("about.desc")}</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-primary mb-6">{t("about.story")}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t("about.storyText")}</p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="font-bold text-primary mb-2">{t("about.vision")}</h3>
                  <p className="text-sm text-muted-foreground">{t("about.visionText")}</p>
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-2">{t("about.mission")}</h3>
                  <p className="text-sm text-muted-foreground">{t("about.missionText")}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-xl overflow-hidden shadow-card">
              <LazyImage {...getEditorialImage(ABOUT_IMAGE_IDS[0])} alt={t("about.heroTitle")} className="w-full h-80 object-cover" />
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-secondary">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">{t("about.values")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 shadow-card">
                  <v.icon className="w-10 h-10 text-accent mx-auto mb-3" strokeWidth={1.5} />
                  <div className="font-bold text-primary">{v.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary">
          <div className="container-custom flex flex-wrap justify-center gap-12 md:gap-20">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-bold text-accent font-mono tabular-nums">{s.value}+</div>
                <div className="text-primary-foreground/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">{t("about.team")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl overflow-hidden shadow-card">
                  <LazyImage {...getPortraitImage(m.imageId)} alt={m.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="font-bold text-primary">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.role}</div>
                  </div>
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

export default AboutPage;
