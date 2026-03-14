import { motion } from "framer-motion";
import { Hammer, PaintBucket, Layers, DoorOpen, KeyRound } from "lucide-react";

const services = [
  {
    icon: Hammer,
    title: "التعديلات الإنشائية والتأسيسات",
    desc: "هدم وإعادة بناء الجدران، تمديدات كهربائية مخفية، شبكات سباكة متطورة، تأسيس أنظمة تكييف مركزي.",
  },
  {
    icon: PaintBucket,
    title: "التشطيبات المعمارية الفاخرة",
    desc: "لياسة، دهانات ديكورية، ورق جدران. أرضيات راقية من باركيه، رخام، وبورسلين كبير المساحة.",
  },
  {
    icon: Layers,
    title: "أعمال الجبس بورد والديكور",
    desc: "أسقف معلقة متعددة المستويات، إفريزات، جدران ديكورية، إضاءة مخفية LED وكوفيات فاخرة.",
  },
  {
    icon: DoorOpen,
    title: "النجارة والمطابخ",
    desc: "تصميم وتصنيع غرف نوم، مطابخ، وحدات تخزين وحلول ذكية بأفضل خامات الأخشاب.",
  },
  {
    icon: KeyRound,
    title: "التشطيب والتسليم النهائي",
    desc: "تركيب أدوات صحية وكهربائية فاخرة، تجهيز مطابخ، أعمال زجاج ومرايا، تسليم على المفتاح.",
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
          <h2 className="text-3xl md:text-4xl text-primary mb-4">خدماتنا من الألف إلى الياء</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
