import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LazyImage from "./LazyImage";
import { getProjectCoverImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const ShowcaseSection = () => {
  const { t } = useLanguage();

  const showcaseItems = [
    { imageId: "retail-interiors/retail-interiors-005", title: t("showcase.living"), desc: t("showcase.livingDesc") },
    { imageId: "retail-interiors/retail-interiors-015", title: t("showcase.bedroom"), desc: t("showcase.bedroomDesc") },
    { imageId: "retail-interiors/retail-interiors-030", title: t("showcase.kitchen"), desc: t("showcase.kitchenDesc") },
    { imageId: "retail-interiors/retail-interiors-045", title: t("showcase.bathroom"), desc: t("showcase.bathroomDesc") },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="text-center mb-16">
          <span className="text-accent text-sm font-bold tracking-wider mb-3 block">{t("showcase.sectionBadge")}</span>
          <h2 className="text-3xl md:text-4xl text-primary mb-4">{t("showcase.sectionTitle")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("showcase.sectionDesc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {showcaseItems.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: i * 0.1, duration: 0.6 }} className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
              <Link to="/projects">
                <LazyImage {...getProjectCoverImage(item.imageId)} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
                  <div className="w-10 h-0.5 bg-accent mb-4 transition-all duration-300 group-hover:w-16" />
                  <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-2">{item.title}</h3>
                  <p className="text-primary-foreground/70 text-sm md:text-base">{item.desc}</p>
                </div>
                <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <ArrowLeft className="w-5 h-5 text-accent-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
