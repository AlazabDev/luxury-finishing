import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield, Clock, MapPin, FileText, Sparkles, ChevronDown, Star } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

type Lang = "ar" | "en";

const copy = {
  ar: {
    brand: "UberFix",
    heroBadge: "باقات الصيانة السنوية للمحلات التجارية",
    heroTitle: "ضمان استمرارية عملك مع UberFix",
    heroDesc:
      "عقود صيانة سنوية شاملة للمحلات التجارية — استجابة سريعة، فريق فني معتمد، وحماية استثمارك على مدار العام.",
    heroCta: "اختر باقتك الآن",
    plansTitle: "اختر الباقة المناسبة لعملك",
    plansSubtitle: "جميع الأسعار سنوية وتشمل الضريبة",
    yearly: "سنوياً",
    mostPopular: "الأكثر طلباً",
    choosePlan: "اختيار الباقة",
    featuresTitle: "لماذا UberFix؟",
    features: [
      { icon: Shield, title: "فريق فني معتمد", desc: "مهندسون وفنيون بخبرة تزيد عن 10 سنوات" },
      { icon: Clock, title: "استجابة خلال ساعتين", desc: "دعم فوري لتقليل توقف عملك" },
      { icon: MapPin, title: "تغطية جميع المدن", desc: "خدمة ميدانية في القاهرة الكبرى والمحافظات" },
      { icon: FileText, title: "عقود مرنة", desc: "خطط قابلة للتخصيص حسب احتياجات محلك" },
    ],
    testimonialsTitle: "ماذا يقول عملاؤنا",
    testimonials: [
      { name: "أحمد محمود", role: "مالك سلسلة مطاعم", text: "منذ اشتراكنا في UberFix، لم نعد نقلق من أعطال التكييف أو الكهرباء. فريق محترف واستجابة سريعة." },
      { name: "منى السيد", role: "مديرة بوتيك", text: "الصيانة الدورية وفّرت علينا الكثير من الأعطال المفاجئة. أنصح كل صاحب محل بالاشتراك." },
      { name: "خالد فاروق", role: "مالك سوبر ماركت", text: "خصم قطع الغيار في الباقة المميزة وحده يوفر قيمة الاشتراك السنوي." },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      { q: "ما هي مدة العقد؟", a: "مدة العقد سنة كاملة قابلة للتجديد، ويمكن ترقية الباقة في أي وقت مع احتساب الفرق." },
      { q: "ماذا يشمل العقد؟", a: "يشمل الصيانة الدورية للمعدات المتفق عليها، والدعم الفني للأعطال الطارئة، وتقارير الأداء حسب نوع الباقة." },
      { q: "كيف يتم إصدار الفواتير؟", a: "يتم إصدار فاتورة سنوية عند بداية العقد، مع إمكانية التقسيط الربع سنوي للباقات الاحترافية والمميزة." },
      { q: "هل تشمل الباقة قطع الغيار؟", a: "الباقة المميزة تمنحك خصم 20% على قطع الغيار الأصلية. باقي الباقات تتضمن العمالة فقط." },
      { q: "هل يمكن إلغاء العقد؟", a: "نعم، يمكن الإلغاء بإشعار مسبق 30 يوم مع استرداد قيمة الفترة غير المستخدمة." },
    ],
    contactTitle: "تحتاج عرض سعر مخصص؟",
    contactDesc: "أخبرنا عن محلك ومعداتك وسنعد لك عرضاً مصمماً خصيصاً لاحتياجاتك.",
    formName: "الاسم الكامل",
    formPhone: "رقم الهاتف",
    formShop: "اسم المحل / النشاط",
    formMessage: "تفاصيل إضافية",
    formSubmit: "طلب عرض سعر",
    formSuccess: "تم استلام طلبك بنجاح، سنتواصل معك قريباً.",
  },
  en: {
    brand: "UberFix",
    heroBadge: "Annual Maintenance Plans for Retail Businesses",
    heroTitle: "Keep Your Business Running with UberFix",
    heroDesc:
      "Annual maintenance contracts for commercial shops — fast response, certified technicians, and year-round protection for your investment.",
    heroCta: "Choose Your Plan",
    plansTitle: "Pick the Right Plan for Your Business",
    plansSubtitle: "All prices are annual and include VAT",
    yearly: "per year",
    mostPopular: "Most Popular",
    choosePlan: "Choose Plan",
    featuresTitle: "Why UberFix?",
    features: [
      { icon: Shield, title: "Certified Team", desc: "Engineers and technicians with 10+ years of experience" },
      { icon: Clock, title: "2-Hour Response", desc: "Immediate support to minimize downtime" },
      { icon: MapPin, title: "Nationwide Coverage", desc: "On-site service across Greater Cairo and governorates" },
      { icon: FileText, title: "Flexible Contracts", desc: "Plans customizable to your shop's needs" },
    ],
    testimonialsTitle: "What Our Clients Say",
    testimonials: [
      { name: "Ahmed Mahmoud", role: "Restaurant Chain Owner", text: "Since we joined UberFix, AC and electrical failures are no longer a worry. Professional team and fast response." },
      { name: "Mona El Sayed", role: "Boutique Manager", text: "Regular maintenance has saved us from many sudden breakdowns. I recommend it to every shop owner." },
      { name: "Khaled Farouk", role: "Supermarket Owner", text: "The 20% spare-parts discount in the Premium plan alone pays for the subscription." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "How long is the contract?", a: "The contract is one full year, renewable. You may upgrade your plan at any time with a prorated difference." },
      { q: "What does the contract include?", a: "Scheduled maintenance for the agreed equipment, technical support for emergencies, and performance reports based on the plan." },
      { q: "How is billing handled?", a: "An annual invoice is issued at contract start, with quarterly installment options for Professional and Premium plans." },
      { q: "Are spare parts included?", a: "The Premium plan grants a 20% discount on genuine spare parts. Other plans cover labor only." },
      { q: "Can I cancel the contract?", a: "Yes, with 30 days prior notice. The unused period will be refunded." },
    ],
    contactTitle: "Need a Custom Quote?",
    contactDesc: "Tell us about your shop and equipment, and we'll craft a plan tailored to your needs.",
    formName: "Full Name",
    formPhone: "Phone Number",
    formShop: "Shop / Business Name",
    formMessage: "Additional Details",
    formSubmit: "Request a Quote",
    formSuccess: "Your request has been received. We'll be in touch shortly.",
  },
} as const;

const plansData = {
  ar: [
    {
      id: "basic",
      name: "أساسية",
      price: "2,400",
      currency: "ج.م",
      tagline: "للمحلات الصغيرة",
      features: [
        "صيانة دورية ربع سنوية",
        "دعم فني 8/5",
        "تقرير حالة سنوي",
        "استجابة خلال 24 ساعة",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "احترافية",
      price: "4,800",
      currency: "ج.م",
      tagline: "الأكثر ملاءمة للنمو",
      features: [
        "صيانة دورية شهرية",
        "دعم فني 24/7",
        "أولوية في البلاغات",
        "استجابة خلال 4 ساعات",
        "تقارير أداء ربع سنوية",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "مميزة",
      price: "8,400",
      currency: "ج.م",
      tagline: "حماية شاملة",
      features: [
        "كل مميزات الاحترافية",
        "زيارات استباقية شهرية",
        "تقارير أداء مفصلة",
        "خصم 20% على قطع الغيار",
        "استجابة خلال ساعتين",
        "مدير حساب مخصص",
      ],
      popular: false,
    },
  ],
  en: [
    {
      id: "basic",
      name: "Basic",
      price: "2,400",
      currency: "EGP",
      tagline: "For small shops",
      features: [
        "Quarterly scheduled maintenance",
        "8/5 technical support",
        "Annual status report",
        "Response within 24 hours",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: "4,800",
      currency: "EGP",
      tagline: "Best for growing businesses",
      features: [
        "Monthly scheduled maintenance",
        "24/7 technical support",
        "Priority ticket handling",
        "Response within 4 hours",
        "Quarterly performance reports",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "8,400",
      currency: "EGP",
      tagline: "Complete protection",
      features: [
        "All Professional features",
        "Monthly proactive visits",
        "Detailed performance reports",
        "20% discount on spare parts",
        "Response within 2 hours",
        "Dedicated account manager",
      ],
      popular: false,
    },
  ],
} as const;

const SubscriptionsPage = () => {
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const L = lang as Lang;
  const c = copy[L];
  const plans = plansData[L];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", phone: "", shop: "", message: "", plan: "" });

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = (planId: string) => {
    setForm((f) => ({ ...f, plan: planId }));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: c.formSuccess });
    setForm({ name: "", phone: "", shop: "", message: "", plan: "" });
  };

  const selectedPlanLabel = useMemo(() => {
    if (!form.plan) return "";
    return plans.find((p) => p.id === form.plan)?.name ?? "";
  }, [form.plan, plans]);

  return (
    <div className="min-h-screen" dir={dir}>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-primary via-primary to-[hsl(236_70%_25%)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 end-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-10 start-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
          </div>
          <div className="container-custom relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs md:text-sm font-bold px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              {c.heroBadge}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 leading-tight"
            >
              {c.heroTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-primary-foreground/80 mb-8"
            >
              {c.heroDesc}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="gold" size="lg" onClick={scrollToPlans} className="text-base px-8 py-6">
                {c.heroCta}
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-3">{c.plansTitle}</h2>
              <p className="text-muted-foreground">{c.plansSubtitle}</p>
              <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary to-[hsl(236_70%_25%)] text-primary-foreground shadow-2xl shadow-primary/20 md:scale-105 ring-2 ring-accent"
                      : "bg-card text-card-foreground shadow-card border border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      {c.mostPopular}
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-1 ${plan.popular ? "text-primary-foreground" : "text-primary"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-bold ${plan.popular ? "text-accent" : "text-primary"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm font-semibold ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.currency}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {c.yearly}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-accent/20" : "bg-accent/15"
                        }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? "text-accent" : "text-accent"}`} />
                        </span>
                        <span className={`text-sm ${plan.popular ? "text-primary-foreground/90" : "text-foreground"}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "gold" : "default"}
                    size="lg"
                    onClick={() => scrollToContact(plan.id)}
                    className="w-full"
                  >
                    {c.choosePlan}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-secondary/50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-3">{c.featuresTitle}</h2>
              <div className="w-16 h-0.5 bg-accent mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl p-6 shadow-card text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-bold text-primary mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-3">{c.testimonialsTitle}</h2>
              <div className="w-16 h-0.5 bg-accent mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {c.testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-card"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-primary text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-secondary/50">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-3">{c.faqTitle}</h2>
              <div className="w-16 h-0.5 bg-accent mx-auto" />
            </div>
            <div className="space-y-3">
              {c.faqs.map((f, i) => (
                <div key={i} className="bg-card rounded-xl shadow-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-start focus-ring"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-bold text-primary flex-1">{f.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-accent transition-transform flex-shrink-0 ms-4 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="section-padding bg-background">
          <div className="container-custom max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl text-primary mb-3">{c.contactTitle}</h2>
              <p className="text-muted-foreground">{c.contactDesc}</p>
              <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-5">
              {selectedPlanLabel && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-sm">
                  <span className="font-semibold text-primary">{selectedPlanLabel}</span>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{c.formName}</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{c.formPhone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="shop">{c.formShop}</Label>
                <Input
                  id="shop"
                  required
                  value={form.shop}
                  onChange={(e) => setForm({ ...form, shop: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="message">{c.formMessage}</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full">
                {c.formSubmit}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default SubscriptionsPage;
