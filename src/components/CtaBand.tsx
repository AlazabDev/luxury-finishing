import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaBand = () => {
  return (
    <section className="py-20 px-4 bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="container-custom text-center"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-6">
          جاهز لتحويل شقتك إلى تحفة فنية؟ دعنا نساعدك
        </h2>
        <Button variant="gold" size="lg" className="text-lg px-10 py-6" asChild>
          <Link to="/contact">تواصل معنا الآن</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default CtaBand;
