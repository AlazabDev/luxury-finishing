import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  const testimonials = [
    { name: t("testimonials.t1.name"), location: t("testimonials.t1.location"), text: t("testimonials.t1.text") },
    { name: t("testimonials.t2.name"), location: t("testimonials.t2.location"), text: t("testimonials.t2.text") },
    { name: t("testimonials.t3.name"), location: t("testimonials.t3.location"), text: t("testimonials.t3.text") },
  ];

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-background">
      <div className="container-custom max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-4">{t("testimonials.sectionTitle")}</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="bg-card rounded-xl p-8 md:p-12 shadow-card text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-lg text-foreground leading-relaxed mb-8 max-w-xl mx-auto">"{testimonials[current].text}"</p>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{testimonials[current].name.charAt(0)}</span>
              </div>
              <div className="font-bold text-primary">{testimonials[current].name}</div>
              <div className="text-sm text-muted-foreground">{testimonials[current].location}</div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center hover:bg-accent/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center hover:bg-accent/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
