import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { HERO_IMAGE } from "@/lib/images";

const stats = [
  { value: "+15", label: "سنة خبرة" },
  { value: "+120", label: "وحدة سكنية منفذة" },
  { value: "+50", label: "تصميم حصري" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to left, rgba(3,9,87,0.92), rgba(3,9,87,0.5))" }}
      />

      <div className="relative z-10 container-custom w-full py-32">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight text-balance mb-6"
          >
            من التأسيس إلى التسليم النهائي..
            <br />
            بيت العمر يبدأ من هنا
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed"
          >
            متخصصون في تشطيب وتصميم الوحدات السكنية الفاخرة بتصاميم عصرية وجودة أوروبية.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Button variant="gold" size="lg" className="text-base px-8 py-6" asChild>
              <Link to="/quote">
                اطلب عرض سعر
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
              <Link to="/projects">
                <Eye className="w-5 h-5" />
                شاهد أعمالنا
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap gap-8 md:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent font-mono tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
