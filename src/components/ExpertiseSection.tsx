import { motion } from "framer-motion";
import { Shield, Lightbulb, Clock, Award } from "lucide-react";
import LazyImage from "./LazyImage";
import { getEditorialImage, getPortraitImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const ExpertiseSection = () => {
  const { t } = useLanguage();

  const cards = [
    { icon: Shield, title: t("expertise.card1"), desc: t("expertise.card1Desc") },
    { icon: Lightbulb, title: t("expertise.card2"), desc: t("expertise.card2Desc") },
    { icon: Clock, title: t("expertise.card3"), desc: t("expertise.card3Desc") },
    { icon: Award, title: t("expertise.card4"), desc: t("expertise.card4Desc") },
  ];

  return (
    <section className="section-padding bg-primary overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}>
            <span className="text-accent text-sm font-bold tracking-wider mb-3 block">{t("expertise.badge")}</span>
            <h2 className="text-3xl md:text-4xl text-primary-foreground mb-6">{t("expertise.whyTitle")}</h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">{t("expertise.whyDesc")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cards.map((card, i) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex-shrink-0 flex items-center justify-center">
                    <card.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary-foreground mb-1">{card.title}</h3>
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                  <LazyImage {...getPortraitImage("retail-interiors/retail-interiors-010")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-square">
                  <LazyImage {...getEditorialImage("retail-interiors/retail-interiors-025")} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden aspect-square">
                  <LazyImage {...getEditorialImage("retail-interiors/retail-interiors-040")} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                  <LazyImage {...getPortraitImage("retail-interiors/retail-interiors-055")} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-accent/30 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-accent/20 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
