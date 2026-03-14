import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Hammer, PaintBucket, Layers, DoorOpen, KeyRound, Headphones, ClipboardCheck, Wrench } from "lucide-react";
import { SERVICE_IMAGES } from "@/lib/images";

const mainServices = [
  {
    icon: Hammer,
    title: "التعديلات الإنشائية والتأسيسات",
    desc: "هدم وإعادة بناء الجدران، تمديدات كهربائية مخفية، شبكات سباكة متطورة، تأسيس أنظمة تكييف مركزي وتبريد موزع.",
    image: SERVICE_IMAGES[0],
  },
  {
    icon: PaintBucket,
    title: "التشطيبات المعمارية الفاخرة",
    desc: "تنفيذ جميع أعمال التشطيبات بأعلى جودة من لياسة ودهانات ديكورية وورق جدران. تركيب أرضيات راقية من باركيه ورخام وسيراميك بورسلين.",
    image: SERVICE_IMAGES[1],
  },
  {
    icon: Layers,
    title: "أعمال الجبس بورد والديكور",
    desc: "تصميم وتنفيذ أسقف جبس بورد معلقة متعددة المستويات، إفريزات، جدران ديكورية، إضاءة مخفية LED وكوفيات لإضفاء أجواء فاخرة.",
    image: SERVICE_IMAGES[2],
  },
  {
    icon: DoorOpen,
    title: "النجارة والمطابخ",
    desc: "تصميم وتصنيع وتركيب غرف نوم ومطابخ ووحدات تخزين وحلول ذكية باستخدام أفضل خامات الأخشاب والإكسسوارات.",
    image: SERVICE_IMAGES[3],
  },
  {
    icon: KeyRound,
    title: "التشطيب والتسليم النهائي",
    desc: "تركيب جميع الأدوات الصحية والكهربائية الفاخرة، تجهيز المطابخ بالكامل، أعمال الزجاج والمرايا، والتسليم على المفتاح.",
    image: SERVICE_IMAGES[4],
  },
];

const extraServices = [
  { icon: Headphones, title: "استشارات هندسية", desc: "نقدم استشارات هندسية متخصصة لمساعدتك في اتخاذ القرارات الصحيحة." },
  { icon: ClipboardCheck, title: "إشراف على المشاريع", desc: "إشراف هندسي متكامل لضمان تنفيذ أعلى معايير الجودة." },
  { icon: Wrench, title: "خدمات ما بعد البيع", desc: "صيانة دورية وخدمات ما بعد التسليم لراحتك التامة." },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
            >
              خدماتنا
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">
              نقدم مجموعة متكاملة من خدمات التشطيب والتصميم الداخلي بأعلى معايير الجودة.
            </p>
          </div>
        </section>

        {/* Main Services */}
        <section className="section-padding bg-background">
          <div className="container-custom space-y-16">
            {mainServices.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:direction-ltr" : ""}`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <s.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-4">{s.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                <div className={`rounded-xl overflow-hidden shadow-card ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <img src={s.image} alt={s.title} className="w-full h-72 object-cover" loading="lazy" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Extra Services */}
        <section className="section-padding bg-secondary">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-primary text-center mb-12">خدمات إضافية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {extraServices.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-8 shadow-card text-center"
                >
                  <s.icon className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-primary mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
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
