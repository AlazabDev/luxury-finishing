import { motion } from "framer-motion";
import {
  Hammer,
  PaintBucket,
  Layers,
  DoorOpen,
  KeyRound,
} from "lucide-react";

const services = [
  {
    icon: Hammer,
    title: "التعديلات الإنشائية",
    desc: "هدم وإعادة بناء الجدران، تمديدات كهربائية مخفية، شبكات سباكة متطورة، تأسيس أنظمة تكييف مركزي.",
    step: "01",
  },
  {
    icon: PaintBucket,
    title: "التشطيبات المعمارية",
    desc: "لياسة، دهانات ديكورية، ورق جدران. أرضيات راقية من باركيه، رخام، وبورسلين.",
    step: "02",
  },
  {
    icon: Layers,
    title: "الجبس بورد والديكور",
    desc: "أسقف معلقة متعددة المستويات، إضاءة مخفية LED وكوفيات فاخرة وجدران ديكورية.",
    step: "03",
  },
  {
    icon: DoorOpen,
    title: "النجارة والمطابخ",
    desc: "تصميم وتصنيع غرف نوم، مطابخ، وحدات تخزين وحلول ذكية بأفضل خامات الأخشاب.",
    step: "04",
  },
  {
    icon: KeyRound,
    title: "التسليم على المفتاح",
    desc: "تركيب أدوات صحية وكهربائية فاخرة، أعمال زجاج ومرايا، تسليم جاهز للسكن.",
    step: "05",
  },
];

const ServicesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-bold tracking-wider mb-3 block">
            خدماتنا المتكاملة
          </span>
          <h2 className="text-3xl md:text-4xl text-primary mb-4">
            من التأسيس إلى التسليم — كل شيء بين أيدينا
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Step number watermark */}
              <span className="absolute -top-2 -left-1 text-7xl font-bold text-accent/[0.06] font-mono select-none">
                {service.step}
              </span>

              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-300">
                <service.icon
                  className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
