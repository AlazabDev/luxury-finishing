import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";

const CtaBand = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url(https://objectstorage.me-jeddah-1.oraclecloud.com/n/axwmiwn72of7/b/alazab-media/o/retail-interiors/retail-interiors-020.jpg)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(3,9,87,0.94), rgba(3,9,87,0.85))",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="container-custom text-center relative z-10"
      >
        <div className="w-12 h-0.5 bg-accent mx-auto mb-6" />
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto leading-tight">
          جاهز لتحويل شقتك إلى تحفة فنية؟
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
          تواصل معنا اليوم واحصل على استشارة مجانية وعرض سعر تفصيلي لمشروعك
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="gold"
            size="lg"
            className="text-lg px-10 py-6 shadow-lg shadow-accent/25"
            asChild
          >
            <Link to="/quote">
              اطلب عرض سعر
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="text-lg px-10 py-6"
            asChild
          >
            <a href="tel:+201004006620">
              <Phone className="w-5 h-5" />
              اتصل الآن
            </a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaBand;
