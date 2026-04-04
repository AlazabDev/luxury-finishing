import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Shield, Award, Users } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { ABOUT_IMAGE_IDS } from "@/lib/images";
import { getEditorialImage, getPortraitImage } from "@/lib/cloudinary";

const values = [
  { icon: Award, label: "الجودة" },
  { icon: Shield, label: "الالتزام" },
  { icon: Target, label: "الابتكار" },
  { icon: Eye, label: "الشفافية" },
];

const stats = [
  { value: "15", label: "سنة خبرة" },
  { value: "120", label: "مشروع منفذ" },
  { value: "50", label: "عميل مكرر" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
            >
              من نحن
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">
              بدأنا رحلتنا في عالم التشطيبات الفاخرة منذ عام 2010، حاملين شعار الجودة والذوق الرفيع.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding bg-background">
          <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">قصتنا</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                تحولنا من مجرد مقاولين إلى شركاء لأصحاب المنازل في تحقيق حلمهم. نؤمن بأن كل منزل يستحق لمسة فنية تعكس شخصية أصحابه.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="font-bold text-primary mb-2">الرؤية</h3>
                  <p className="text-sm text-muted-foreground">أن نكون الخيار الأول للتشطيبات السكنية الفاخرة في المنطقة.</p>
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-2">الرسالة</h3>
                  <p className="text-sm text-muted-foreground">تقديم تجربة متكاملة تجمع بين التصميم المبتكر والتنفيذ المتقن.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-card"
            >
              <LazyImage
                {...getEditorialImage(ABOUT_IMAGE_IDS[0])}
                alt="عن الشركة"
                className="w-full h-80 object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-secondary">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">قيمنا</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <v.icon className="w-10 h-10 text-accent mx-auto mb-3" strokeWidth={1.5} />
                  <div className="font-bold text-primary">{v.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
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

        {/* Team */}
        <section className="section-padding bg-background">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">فريق القيادة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "م. أحمد العزب", role: "المدير التنفيذي", imageId: ABOUT_IMAGE_IDS[1] },
                { name: "م. محمد حسن", role: "مدير المشاريع", imageId: ABOUT_IMAGE_IDS[2] },
                { name: "م. سارة إبراهيم", role: "مديرة التصميم", imageId: ABOUT_IMAGE_IDS[0] },
              ].map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden shadow-card"
                >
                  <LazyImage
                    {...getPortraitImage(m.imageId)}
                    alt={m.name}
                    className="w-full h-48 object-cover"
                  />
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
