import { motion } from "framer-motion";
import { ClipboardList, Box, CheckSquare, HardHat, Key } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TimelineSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: ClipboardList, title: t("timeline.s1"), desc: t("timeline.s1Desc") },
    { icon: Box, title: t("timeline.s2"), desc: t("timeline.s2Desc") },
    { icon: CheckSquare, title: t("timeline.s3"), desc: t("timeline.s3Desc") },
    { icon: HardHat, title: t("timeline.s4"), desc: t("timeline.s4Desc") },
    { icon: Key, title: t("timeline.s5"), desc: t("timeline.s5Desc") },
  ];

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-primary mb-4">{t("timeline.mainTitle")}</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="hidden lg:grid grid-cols-5 gap-4 relative">
          <div className="absolute top-10 right-[10%] left-[10%] h-px border-t-2 border-dashed border-accent/40" />
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: i * 0.15 }} className="relative text-center">
              <div className="w-20 h-20 rounded-full bg-card shadow-card flex items-center justify-center mx-auto mb-4 relative z-10 border-2 border-accent/20">
                <step.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-bold text-accent mb-2">{t("timeline.step")} {i + 1}</div>
              <h3 className="text-sm font-bold text-primary mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="lg:hidden flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="min-w-[220px] snap-center text-center flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-card shadow-card flex items-center justify-center mx-auto mb-3 border-2 border-accent/20">
                <step.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-bold text-accent mb-1">{t("timeline.step")} {i + 1}</div>
              <h3 className="text-sm font-bold text-primary mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
