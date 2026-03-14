import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BLOG_IMAGES, SERVICE_IMAGES } from "@/lib/images";

const posts = [
  { title: "أفكار ذكية لتصميم غرف المعيشة المفتوحة", category: "تصميم داخلي", image: BLOG_IMAGES[0], excerpt: "اكتشف أفضل الطرق لتصميم غرف معيشة مفتوحة تجمع بين الأناقة والوظيفية." },
  { title: "دليلك لاختيار الأرضيات: باركيه أم رخام أم بورسلين؟", category: "مواد بناء", image: BLOG_IMAGES[1], excerpt: "مقارنة شاملة بين أنواع الأرضيات لمساعدتك في اتخاذ القرار الأمثل لمنزلك." },
  { title: "أحدث صيحات ألوان الدهانات الديكورية لعام 2024", category: "ديكور", image: BLOG_IMAGES[2], excerpt: "تعرف على أحدث اتجاهات الألوان التي تضفي طابعاً عصرياً على مساحاتك." },
  { title: "كيف تختار تصميم المطبخ المثالي لمنزلك", category: "تصميم داخلي", image: GALLERY_IMAGES[8], excerpt: "نصائح عملية لتصميم مطبخ يجمع بين الجمال والعملية." },
  { title: "أسرار الإضاءة الداخلية الاحترافية", category: "ديكور", image: GALLERY_IMAGES[9], excerpt: "كيف تستخدم الإضاءة لتحويل أي مساحة إلى تحفة فنية." },
  { title: "دليل اختيار الخامات المناسبة للحمامات", category: "مواد بناء", image: GALLERY_IMAGES[10], excerpt: "كل ما تحتاج معرفته عن خامات الحمامات الفاخرة." },
];

const BlogPage = () => {
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
              المدونة
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg">أحدث اتجاهات الديكور والتشطيبات.</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-accent">{post.category}</span>
                    <h2 className="text-lg font-bold text-primary mt-2 mb-3">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm text-accent font-bold">
                      اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </motion.article>
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

export default BlogPage;
