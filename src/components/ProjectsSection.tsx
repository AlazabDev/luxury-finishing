import { motion } from "framer-motion";
import { Eye, Images, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { galleryProjects, totalImageCount } from "@/lib/images";
import { Button } from "@/components/ui/button";
import LazyImage from "./LazyImage";
import { getProjectCoverImage } from "@/lib/cloudinary";
import { useLanguage } from "@/contexts/LanguageContext";

const featured = galleryProjects.slice(0, 4);

const ProjectsSection = () => {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="text-accent text-sm font-bold tracking-wider mb-3 block">{t("projectsSection.badge")}</span>
            <h2 className="text-3xl md:text-4xl text-primary mb-2">{t("projectsSection.title")}</h2>
            <p className="text-muted-foreground max-w-lg">{t("projectsSection.desc")}</p>
          </div>
          <Button variant="outline" size="lg" className="self-start md:self-auto border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
            <Link to="/projects">
              {t("projectsSection.viewAll")} ({totalImageCount}+)
              <Arrow className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: i * 0.1 }} className={`group relative rounded-2xl overflow-hidden cursor-pointer ${i === 0 ? "lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-[4/3]"}`}>
              <Link to="/projects" className="block w-full h-full">
                <LazyImage {...getProjectCoverImage(project.coverImageId)} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-primary/60 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" />
                  {project.imageIds.length}
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <Eye className="w-12 h-12 text-primary-foreground mx-auto" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-5 md:p-6">
                  <span className="text-xs font-bold text-accent bg-accent/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{project.category}</span>
                  <h3 className="text-lg md:text-xl font-bold text-primary-foreground mt-2">{project.title}</h3>
                  <p className="text-primary-foreground/60 text-sm mt-1 line-clamp-1">{project.location} — {project.year}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
