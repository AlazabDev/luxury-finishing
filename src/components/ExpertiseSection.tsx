import { motion } from "framer-motion";
import { Heart, Lightbulb, Clock } from "lucide-react";

const cards = [
  {
    icon: Heart,
    title: "فهم احتياجات الأسرة",
    desc: "نستمع لرغباتك ونصمم مساحات تناسب نمط حياتك، سواء كنت تبحث عن الفخامة الكلاسيكية أو البساطة العصرية.",
  },
  {
    icon: Lightbulb,
    title: "تصميمات عصرية وحلول ذكية",
    desc: "تصاميم معمارية مبتكرة تزيد من مساحات التخزين وتوفر الراحة مع لمسات جمالية عصرية.",
  },
  {
    icon: Clock,
    title: "التزام بالمواعيد والجودة",
    desc: "ندرك أهمية تسليم منزلك في الوقت المتفق عليه، مع الالتزام بأعلى معايير الجودة والشفافية.",
  },
];

const ExpertiseSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl text-primary mb-4">
            لماذا تختار Luxury Finishing لبيتك؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نحن لا ننفذ تشطيباً عادياً.. بل نصنع مساحة تعكس شخصيتك وذوقك الرفيع.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <card.icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
