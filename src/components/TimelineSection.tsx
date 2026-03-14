import { motion } from "framer-motion";
import { ClipboardList, Cube, CheckSquare, HardHat, Key } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "استشارة وزيارة ميدانية", desc: "فريقنا يزور الشقة ويأخذ المقاسات بدقة ويناقش أفكارك." },
  { icon: Cube, title: "تصميم أولي (3D)", desc: "نقدم لك تصميماً ثلاثي الأبعاد للمساحات قبل بدء العمل." },
  { icon: CheckSquare, title: "اعتماد العروض والمواد", desc: "نحدد الخامات النهائية والتكاليف بشفافية كاملة." },
  { icon: HardHat, title: "التنفيذ والإشراف", desc: "نبدأ العمل تحت إشراف مهندسين متخصصين." },
  { icon: Key, title: "التسليم النهائي", desc: "نسلمك منزل أحلامك جاهزاً للسكن." },
];

const TimelineSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl text-primary mb-4">من الفكرة إلى الاستلام في 5 خطوات</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-5 gap-4 relative">
          {/* Dashed line */}
          <div className="absolute top-10 right-[10%] left-[10%] h-px border-t-2 border-dashed border-accent/40" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 rounded-full bg-card shadow-card flex items-center justify-center mx-auto mb-4 relative z-10 border-2 border-accent/20">
                <step.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-bold text-accent mb-2">الخطوة {i + 1}</div>
              <h3 className="text-sm font-bold text-primary mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="lg:hidden flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[220px] snap-center text-center flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-card shadow-card flex items-center justify-center mx-auto mb-3 border-2 border-accent/20">
                <step.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <div className="text-xs font-bold text-accent mb-1">الخطوة {i + 1}</div>
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
