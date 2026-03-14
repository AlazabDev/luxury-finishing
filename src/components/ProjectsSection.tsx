import { motion } from "framer-motion";
import { Eye, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { galleryProjects } from "@/lib/images";

const featured = galleryProjects.slice(0, 4);

const ProjectsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl text-primary mb-4">أحدث مشاريعنا</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
            >
              <Link to="/projects">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-primary/60 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" />
                  {project.images.length}
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <Eye className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-5">
                  <span className="text-xs font-bold text-accent bg-accent/20 backdrop-blur-sm px-2.5 py-1 rounded-full">{project.category}</span>
                  <h3 className="text-lg font-bold text-primary-foreground mt-2">{project.title}</h3>
                </div>
              </Link>
              <div className="absolute inset-0 rounded-xl" style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: "-1px" }} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-accent font-bold hover:underline text-lg"
          >
            عرض جميع المشاريع ({galleryProjects.length} مشروع)
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
