import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "ما هي مدة تنفيذ مشروع التشطيب؟", a: "تعتمد المدة على حجم المشروع ونوع التشطيبات المطلوبة. في المتوسط، تتراوح المدة بين 3 إلى 6 أشهر للشقق و6 إلى 12 شهراً للفلل." },
  { q: "هل تقدمون ضمان على الأعمال؟", a: "نعم، نقدم ضمان شامل لمدة سنة على جميع أعمال التشطيب وسنتين على الأعمال الإنشائية." },
  { q: "كيف يتم تحديد التكلفة؟", a: "يتم تحديد التكلفة بناءً على مساحة العقار، نوع التشطيبات، والخامات المختارة. نقدم عرض سعر تفصيلي وشفاف قبل البدء." },
  { q: "هل يمكنني اختيار الخامات بنفسي؟", a: "بالطبع! نحن نساعدك في اختيار أفضل الخامات ونوفر لك خيارات متعددة تناسب ميزانيتك وذوقك." },
  { q: "هل تقدمون تصاميم 3D قبل التنفيذ؟", a: "نعم، نقدم تصميمات ثلاثية الأبعاد لجميع المساحات حتى تتمكن من تصور النتيجة النهائية قبل البدء." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نوفر خطط دفع مرنة تناسب ميزانيتك. يتم الدفع على مراحل مرتبطة بتقدم العمل." },
  { q: "هل تقدمون خدمات صيانة بعد التسليم؟", a: "نعم، نقدم خدمات صيانة دورية وطوارئ بعد التسليم لضمان راحتك التامة." },
  { q: "هل يمكنني متابعة سير العمل؟", a: "بالتأكيد! نوفر تحديثات دورية بالصور والفيديو ويمكنك زيارة الموقع في أي وقت." },
];

const FaqPage = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              الأسئلة الشائعة
            </motion.h1>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-right"
                >
                  <span className="font-bold text-primary text-right flex-1">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-accent transition-transform flex-shrink-0 mr-4 ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default FaqPage;
