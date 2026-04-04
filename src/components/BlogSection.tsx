import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";
import { BLOG_IMAGE_IDS } from "@/lib/images";
import { getArticleCardImage } from "@/lib/cloudinary";

const posts = [
  {
    title: "أفكار ذكية لتصميم غرف المعيشة المفتوحة",
    imageId: BLOG_IMAGE_IDS[0],
    category: "تصميم داخلي",
  },
  {
    title: "دليلك لاختيار الأرضيات: باركيه أم رخام أم بورسلين؟",
    imageId: BLOG_IMAGE_IDS[1],
    category: "مواد بناء",
  },
  {
    title: "أحدث صيحات ألوان الدهانات الديكورية لعام 2024",
    imageId: BLOG_IMAGE_IDS[2],
    category: "ديكور",
  },
];

const BlogSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl text-primary mb-4">أحدث اتجاهات الديكور والتشطيبات</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="aspect-video overflow-hidden">
                <LazyImage
                  {...getArticleCardImage(post.imageId)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-accent">{post.category}</span>
                <h3 className="text-lg font-bold text-primary mt-2 mb-4 leading-relaxed">{post.title}</h3>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm text-accent font-bold hover:underline"
                >
                  اقرأ المزيد
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
