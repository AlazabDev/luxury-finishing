import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECT_IMAGES } from "@/lib/images";

const projects = [
  { title: "شقة فيلا - التجمع الخامس", type: "فيلا", image: PROJECT_IMAGES[0] },
  { title: "بنتهاوس - زايد", type: "بنتهاوس", image: PROJECT_IMAGES[1] },
  { title: "دوبلكس - الرحاب", type: "دوبلكس", image: PROJECT_IMAGES[2] },
  { title: "شقة عصرية - المهندسين", type: "شقة", image: PROJECT_IMAGES[3] },
];

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
          <h2 className="text-3xl md:text-4xl text-primary mb-4">أحدث مشاريعنا السكنية</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] md:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                  <Eye className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-primary-foreground mb-1">{project.title}</h3>
                  <span className="text-sm text-accent">{project.type}</span>
                </div>
              </div>
              {/* Outline frame */}
              <div className="absolute inset-0 rounded-xl" style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: "-1px" }} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-accent font-bold hover:underline"
          >
            عرض جميع المشاريع
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
