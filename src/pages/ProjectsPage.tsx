import { useState, useMemo, useCallback } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import GalleryLightbox from "@/components/GalleryLightbox";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Images, MapPin, Calendar, ArrowLeft, Grid3X3, LayoutGrid } from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { galleryProjects, galleryCategories, totalImageCount, type GalleryProject } from "@/lib/images";
import { Button } from "@/components/ui/button";

type ViewMode = "projects" | "gallery";

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [viewMode, setViewMode] = useState<ViewMode>("projects");
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "الكل") return galleryProjects;
    return galleryProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // All images from filtered projects for gallery view
  const allFilteredImages = useMemo(() => {
    return filteredProjects.flatMap((p) => p.images);
  }, [filteredProjects]);

  const openLightbox = useCallback((images: string[], index: number, title?: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const openProjectDetail = (project: GalleryProject) => {
    setSelectedProject(project);
    setVisibleCount(12);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedProject(null);
    setVisibleCount(12);
  };

  const stats = [
    { value: galleryProjects.length, label: "مشروع" },
    { value: totalImageCount, label: "صورة" },
    { value: "3", label: "تصنيفات" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,185,0,0.3) 0%, transparent 50%)" }} />
          <div className="container-custom relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
                معرض أعمالنا
              </h1>
              <p className="text-primary-foreground/70 text-lg mb-8">
                استعرض مجموعة شاملة من مشاريعنا المنفذة في التشطيبات السكنية والتجارية بأعلى معايير الجودة والاحترافية.
              </p>
            </motion.div>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-10 mt-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-accent font-mono tabular-nums">{s.value}+</div>
                  <div className="text-primary-foreground/50 text-sm">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Controls */}
        <section className="sticky top-[60px] z-40 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container-custom py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      activeCategory === cat
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                        : "bg-secondary text-muted-foreground hover:bg-accent/10 hover:text-accent"
                    }`}
                  >
                    {cat}
                    {cat !== "الكل" && (
                      <span className="mr-2 text-xs opacity-70">
                        ({galleryProjects.filter((p) => p.category === cat).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                <button
                  onClick={() => { setViewMode("projects"); setSelectedProject(null); }}
                  className={`p-2 rounded-full transition-all ${viewMode === "projects" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
                  title="عرض المشاريع"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setViewMode("gallery"); setSelectedProject(null); }}
                  className={`p-2 rounded-full transition-all ${viewMode === "gallery" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
                  title="عرض الصور"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding bg-background min-h-[60vh]">
          <div className="container-custom">
            <AnimatePresence mode="wait">
              {/* Project Detail View */}
              {selectedProject ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center gap-2 text-accent font-bold mb-8 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    العودة إلى المشاريع
                  </button>

                  {/* Project header */}
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">{selectedProject.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-accent" />{selectedProject.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-accent" />{selectedProject.year}</span>
                      <span className="flex items-center gap-1"><Images className="w-4 h-4 text-accent" />{selectedProject.images.length} صورة</span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">{selectedProject.description}</p>
                  </div>

                  {/* Masonry Grid */}
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {selectedProject.images.slice(0, visibleCount).map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(selectedProject.images, i, selectedProject.title)}
                      >
                        <img
                          src={img}
                          alt={`${selectedProject.title} - صورة ${i + 1}`}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: "-1px" }}
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                              <Eye className="w-6 h-6 text-primary-foreground" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Load more */}
                  {visibleCount < selectedProject.images.length && (
                    <div className="text-center mt-12">
                      <Button
                        variant="gold-outline"
                        size="lg"
                        onClick={() => setVisibleCount((v) => v + 12)}
                        className="px-10"
                      >
                        <Images className="w-5 h-5" />
                        عرض المزيد ({selectedProject.images.length - visibleCount} صورة متبقية)
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : viewMode === "projects" ? (
                /* Projects Grid View */
                <motion.div
                  key="projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project, i) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                        onClick={() => openProjectDetail(project)}
                      >
                        {/* Cover image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                          
                          {/* Image count badge */}
                          <div className="absolute top-4 left-4 bg-primary/70 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Images className="w-3.5 h-3.5" />
                            {project.images.length}
                          </div>

                          {/* Bottom info overlay */}
                          <div className="absolute bottom-0 right-0 left-0 p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-accent bg-accent/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                {project.category}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-primary-foreground leading-snug">{project.title}</h3>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{project.year}</span>
                            </div>
                            <span className="text-accent text-sm font-bold flex items-center gap-1 group-hover:underline">
                              عرض <ArrowLeft className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>

                        {/* Preview thumbnails */}
                        <div className="px-5 pb-5">
                          <div className="flex gap-1.5">
                            {project.images.slice(1, 5).map((img, j) => (
                              <div key={j} className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                            ))}
                            {project.images.length > 5 && (
                              <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-muted-foreground">+{project.images.length - 5}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* Gallery Grid View (all images) */
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6 text-sm text-muted-foreground">
                    عرض {Math.min(visibleCount, allFilteredImages.length)} من {allFilteredImages.length} صورة
                  </div>
                  <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
                    {allFilteredImages.slice(0, visibleCount).map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.02, 0.4) }}
                        className="break-inside-avoid group relative rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(allFilteredImages, i)}
                      >
                        <img
                          src={img}
                          alt={`صورة ${i + 1}`}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          style={{ outline: "1px solid rgba(0,0,0,0.05)", outlineOffset: "-1px" }}
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-6 h-6 text-primary-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {visibleCount < allFilteredImages.length && (
                    <div className="text-center mt-12">
                      <Button
                        variant="gold-outline"
                        size="lg"
                        onClick={() => setVisibleCount((v) => v + 20)}
                        className="px-10"
                      >
                        <Images className="w-5 h-5" />
                        عرض المزيد ({allFilteredImages.length - visibleCount} صورة متبقية)
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingElements />

      {/* Lightbox */}
      <GalleryLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};

export default ProjectsPage;
