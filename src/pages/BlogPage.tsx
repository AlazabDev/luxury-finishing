import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LazyImage from "@/components/LazyImage";
import { BLOG_IMAGE_IDS, SERVICE_IMAGE_IDS } from "@/lib/images";
import { getArticleCardImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const BlogPage = () => {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const posts = [
    { title: t("blog.post1"), category: t("blog.cat.interior"), imageId: BLOG_IMAGE_IDS[0], excerpt: t("blog.excerpt1") },
    { title: t("blog.post2"), category: t("blog.cat.materials"), imageId: BLOG_IMAGE_IDS[1], excerpt: t("blog.excerpt2") },
    { title: t("blog.post3"), category: t("blog.cat.decor"), imageId: BLOG_IMAGE_IDS[2], excerpt: t("blog.excerpt3") },
    { title: t("blog.post4"), category: t("blog.cat.interior"), imageId: SERVICE_IMAGE_IDS[2], excerpt: t("blog.excerpt4") },
    { title: t("blog.post5"), category: t("blog.cat.decor"), imageId: SERVICE_IMAGE_IDS[3], excerpt: t("blog.excerpt5") },
    { title: t("blog.post6"), category: t("blog.cat.materials"), imageId: SERVICE_IMAGE_IDS[4], excerpt: t("blog.excerpt6") },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("blog.heroTitle")}
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg">{t("blog.desc")}</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article key={post.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group">
                  <div className="aspect-video overflow-hidden">
                    <LazyImage {...getArticleCardImage(post.imageId)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-accent">{post.category}</span>
                    <h2 className="text-lg font-bold text-primary mt-2 mb-3">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm text-accent font-bold">
                      {t("blog.readMore")} <Arrow className="w-4 h-4" />
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
