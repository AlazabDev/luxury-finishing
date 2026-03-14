import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";

const PrivacyPage = () => (
  <div className="min-h-screen">
    <SiteHeader />
    <main>
      <section className="relative pt-32 pb-20 bg-primary">
        <div className="container-custom">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground">
            سياسة الخصوصية
          </motion.h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl prose prose-lg" style={{ direction: "rtl" }}>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">جمع المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed">نجمع المعلومات التي تقدمها لنا مباشرة عند استخدامك لخدماتنا، مثل الاسم والبريد الإلكتروني ورقم الهاتف وتفاصيل المشروع.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">استخدام المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed">نستخدم معلوماتك لتقديم خدماتنا وتحسينها، والتواصل معك بشأن المشاريع والعروض، وتخصيص تجربتك على موقعنا.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">حماية المعلومات</h2>
              <p className="text-muted-foreground leading-relaxed">نلتزم بحماية معلوماتك الشخصية ونستخدم إجراءات أمنية مناسبة لحمايتها من الوصول غير المصرح به.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">التواصل</h2>
              <p className="text-muted-foreground leading-relaxed">لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر brand.identity@alazab.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
    <FloatingElements />
  </div>
);

export default PrivacyPage;
