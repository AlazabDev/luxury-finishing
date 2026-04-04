import { motion } from "framer-motion";
import { Shield, Lightbulb, Clock, Award } from "lucide-react";
import LazyImage from "./LazyImage";
import { getEditorialImage, getPortraitImage } from "@/lib/cloudinary";

const cards = [
  {
    icon: Shield,
    title: "ضمان جودة شامل",
    desc: "نلتزم بأعلى معايير الجودة مع ضمان على جميع الأعمال المنفذة.",
  },
  {
    icon: Lightbulb,
    title: "تصاميم عصرية ومبتكرة",
    desc: "تصاميم 3D قبل التنفيذ تساعدك على تخيل منزلك قبل البدء.",
  },
  {
    icon: Clock,
    title: "التزام صارم بالمواعيد",
    desc: "جداول زمنية واضحة مع تحديثات دورية حتى التسليم.",
  },
  {
    icon: Award,
    title: "خامات أوروبية فاخرة",
    desc: "نتعامل مع أفضل موردي الخامات لضمان متانة وجمال التشطيبات.",
  },
];

const ExpertiseSection = () => {
  return (
    <section className="section-padding bg-primary overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <span className="text-accent text-sm font-bold tracking-wider mb-3 block">
              لماذا نحن
            </span>
            <h2 className="text-3xl md:text-4xl text-primary-foreground mb-6">
              لماذا يثق بنا عملاؤنا في تشطيب منازلهم؟
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">
              نحن لا ننفذ تشطيباً عادياً — بل نصنع مساحة تعكس شخصيتك وذوقك
              الرفيع بأعلى معايير الاحترافية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex-shrink-0 flex items-center justify-center">
                    <card.icon
                      className="w-6 h-6 text-accent"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary-foreground mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                  <LazyImage
                    {...getPortraitImage("retail-interiors/retail-interiors-010")}
                    alt="تشطيبات سكنية"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-square">
                  <LazyImage
                    {...getEditorialImage("retail-interiors/retail-interiors-025")}
                    alt="ديكورات داخلية"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden aspect-square">
                  <LazyImage
                    {...getEditorialImage("retail-interiors/retail-interiors-040")}
                    alt="مطابخ حديثة"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                  <LazyImage
                    {...getPortraitImage("retail-interiors/retail-interiors-055")}
                    alt="غرف نوم فاخرة"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Accent border */}
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-accent/30 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-accent/20 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
