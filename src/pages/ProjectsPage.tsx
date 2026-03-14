import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { GALLERY_IMAGES } from "@/lib/images";

const projects = [
  { title: "شقة فاخرة - التجمع الخامس", type: "شقة", year: "2024", image: GALLERY_IMAGES[0] },
  { title: "فيلا - الشيخ زايد", type: "فيلا", year: "2024", image: GALLERY_IMAGES[1] },
  { title: "دوبلكس - الرحاب", type: "دوبلكس", year: "2023", image: GALLERY_IMAGES[2] },
  { title: "شقة عصرية - المهندسين", type: "شقة", year: "2023", image: GALLERY_IMAGES[3] },
  { title: "فيلا فاخرة - القاهرة الجديدة", type: "فيلا", year: "2023", image: GALLERY_IMAGES[4] },
  { title: "بنتهاوس - المعادي", type: "شقة", year: "2024", image: GALLERY_IMAGES[5] },
  { title: "فيلا كلاسيكية - أكتوبر", type: "فيلا", year: "2022", image: GALLERY_IMAGES[6] },
  { title: "دوبلكس حديث - الشروق", type: "دوبلكس", year: "2024", image: GALLERY_IMAGES[7] },
];

const filters = ["الكل", "شقة", "فيلا", "دوبلكس"];

const ProjectsPage = () => {
  const [active, setActive] = useState("الكل");
  const filtered = active === "الكل" ? projects : projects.filter((p) => p.type === active);

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
              معرض المشاريع
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg">استعرض أحدث مشاريعنا في التشطيبات الفاخرة.</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-12 justify-center">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActive(f)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    active === f
                      ? "bg-accent text-accent-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 group-hover:backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <Eye className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-primary-foreground mb-1">{project.title}</h3>
                      <span className="text-sm text-accent">{project.type} • {project.year}</span>
                    </div>
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

export default ProjectsPage;
