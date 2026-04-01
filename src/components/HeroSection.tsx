import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PROJECT_IMAGES, HERO_IMAGE } from "@/lib/images";

const heroSlides = [
  {
    image: HERO_IMAGE,
    title: "من التأسيس إلى التسليم النهائي",
    subtitle: "بيت العمر يبدأ من هنا",
  },
  {
    image: PROJECT_IMAGES[0],
    title: "تصميمات داخلية تنبض بالحياة",
    subtitle: "نحوّل رؤيتك إلى واقع ملموس",
  },
  {
    image: PROJECT_IMAGES[1],
    title: "خامات أوروبية بمعايير عالمية",
    subtitle: "جودة لا تقبل المساومة",
  },
  {
    image: PROJECT_IMAGES[2],
    title: "أكثر من 120 وحدة سكنية منفذة",
    subtitle: "خبرة 15 عاماً في التشطيبات الفاخرة",
  },
];

const stats = [
  { value: 15, suffix: "+", label: "سنة خبرة" },
  { value: 120, suffix: "+", label: "وحدة سكنية" },
  { value: 50, suffix: "+", label: "تصميم حصري" },
  { value: 98, suffix: "%", label: "رضا العملاء" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, started]);

  return (
    <motion.div
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
      className="text-3xl md:text-5xl font-bold text-accent font-mono tabular-nums"
    >
      {count}{suffix}
    </motion.div>
  );
}

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % heroSlides.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + heroSlides.length) % heroSlides.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current];

  return (
    <>
      {/* Hero with slideshow */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to left, rgba(3,9,87,0.93), rgba(3,9,87,0.6) 60%, rgba(3,9,87,0.4))",
          }}
        />

        {/* Decorative geometric lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-40 h-40 border border-accent/10 rounded-full" />
          <div className="absolute bottom-32 left-16 w-64 h-64 border border-accent/5 rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
        </div>

        <div className="relative z-10 container-custom w-full py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-accent/15 backdrop-blur-sm border border-accent/20 text-accent text-sm font-bold px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              متخصصون في التشطيبات السكنية الفاخرة منذ 2010
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7 }}
              >
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight text-balance mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-3xl font-heading text-accent font-bold mb-6">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/75 mb-10 max-w-2xl leading-relaxed"
            >
              نصمم وننفذ تشطيبات وحدتك السكنية بتصاميم عصرية وجودة أوروبية — من
              الاستشارة الأولى إلى التسليم على المفتاح.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                variant="gold"
                size="lg"
                className="text-base px-8 py-6 shadow-lg shadow-accent/25"
                asChild
              >
                <Link to="/quote">
                  اطلب عرض سعر مجاني
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="text-base px-8 py-6"
                asChild
              >
                <Link to="/projects">
                  <Eye className="w-5 h-5" />
                  شاهد أعمالنا
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Slide navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-8 bg-accent"
                    : "w-3 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 -mt-16">
        <div className="container-custom">
          <div className="bg-card rounded-2xl shadow-card-hover p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 border border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
