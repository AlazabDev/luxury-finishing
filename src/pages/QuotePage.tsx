import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const steps = ["معلومات أساسية", "تفاصيل العقار", "الخدمات المطلوبة", "الميزانية", "المراجعة"];

const serviceOptions = [
  "التعديلات الإنشائية",
  "التشطيبات المعمارية",
  "أعمال الجبس والديكور",
  "النجارة والمطابخ",
  "التسليم النهائي",
  "استشارات هندسية",
];

const propertyTypes = ["شقة", "فيلا", "دوبلكس", "بنتهاوس", "تاون هاوس", "استوديو"];

const budgetOptions = [
  "أقل من 100,000 جنيه",
  "100,000 - 300,000 جنيه",
  "300,000 - 500,000 جنيه",
  "500,000 - 1,000,000 جنيه",
  "أكثر من 1,000,000 جنيه",
];

// Validation schemas per step
const step0Schema = z.object({
  name: z.string().trim().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  phone: z.string().trim().min(10, "رقم الهاتف غير صحيح").max(15).regex(/^[+\d\s-]+$/, "رقم هاتف غير صالح"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255).or(z.literal("")),
});

const step1Schema = z.object({
  propertyType: z.string().min(1, "اختر نوع العقار"),
  area: z.string().trim().min(1, "أدخل المساحة").max(20),
  location: z.string().trim().min(2, "أدخل الموقع").max(200),
  floors: z.string().max(10),
});

interface FormData {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  area: string;
  location: string;
  floors: string;
  services: string[];
  budget: string;
  notes: string;
}

const QuotePage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    propertyType: "",
    area: "",
    location: "",
    floors: "",
    services: [],
    budget: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const update = (field: keyof FormData, value: string | string[]) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const n = { ...p };
      delete n[field];
      return n;
    });
  };

  const toggleService = (s: string) => {
    const arr = form.services.includes(s)
      ? form.services.filter((x) => x !== s)
      : [...form.services, s];
    update("services", arr);
  };

  const validateStep = (): boolean => {
    try {
      if (step === 0) {
        step0Schema.parse({ name: form.name, phone: form.phone, email: form.email });
      } else if (step === 1) {
        step1Schema.parse({
          propertyType: form.propertyType,
          area: form.area,
          location: form.location,
          floors: form.floors,
        });
      } else if (step === 2 && form.services.length === 0) {
        setErrors({ services: "اختر خدمة واحدة على الأقل" });
        return false;
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const next = () => {
    if (validateStep() && step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("quote_requests").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        property_type: form.propertyType,
        area: form.area.trim(),
        location: form.location.trim(),
        floors: form.floors.trim() || null,
        services: form.services,
        budget: form.budget || null,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all";
  const errorClass = "text-destructive text-xs mt-1";

  if (submitted) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="pt-32 pb-20">
          <div className="container-custom max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-12 shadow-card text-center"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                تم إرسال طلبك بنجاح!
              </h2>
              <p className="text-muted-foreground mb-8">
                سيتواصل معك فريقنا خلال 24 ساعة لتقديم عرض السعر التفصيلي.
              </p>
              <Button variant="gold" size="lg" onClick={() => { setSubmitted(false); setStep(0); setForm({ name: "", phone: "", email: "", propertyType: "", area: "", location: "", floors: "", services: [], budget: "", notes: "" }); }}>
                تقديم طلب جديد
              </Button>
            </motion.div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-primary overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 w-40 h-40 border border-accent/10 rounded-full" />
            <div className="absolute bottom-0 left-20 w-64 h-64 border border-accent/5 rounded-full" />
          </div>
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-accent text-sm font-bold tracking-wider mb-3 block">
                عرض سعر مجاني
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                احصل على عرض سعر لمشروعك
              </h1>
              <p className="text-primary-foreground/70 text-lg max-w-xl">
                أكمل النموذج التالي وسيتواصل معك فريقنا بعرض سعر تفصيلي خلال 24
                ساعة
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form */}
        <section className="section-padding bg-background">
          <div className="container-custom max-w-2xl">
            {/* Progress */}
            <div className="flex items-center justify-between mb-12">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => { if (i < step) setStep(i); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step
                        ? "bg-accent text-accent-foreground cursor-pointer"
                        : i === step
                        ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                        : "bg-muted text-muted-foreground cursor-default"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-6 md:w-14 h-0.5 mx-1 transition-colors ${
                        i < step ? "bg-accent" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-6 md:p-10 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold">{step + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-primary">
                  {steps[step]}
                </h2>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Step 0: Basic Info */}
                  {step === 0 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          الاسم الكامل <span className="text-destructive">*</span>
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className={inputClass}
                        />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          رقم الهاتف <span className="text-destructive">*</span>
                        </label>
                        <input
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          dir="ltr"
                          className={`${inputClass} text-left`}
                        />
                        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          البريد الإلكتروني (اختياري)
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          type="email"
                          placeholder="example@email.com"
                          dir="ltr"
                          className={`${inputClass} text-left`}
                        />
                        {errors.email && <p className={errorClass}>{errors.email}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Property Details */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          نوع العقار <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {propertyTypes.map((t) => (
                            <button
                              key={t}
                              onClick={() => update("propertyType", t)}
                              className={`p-3 rounded-xl text-sm font-medium text-center transition-all ${
                                form.propertyType === t
                                  ? "bg-accent/10 border-2 border-accent text-primary"
                                  : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-accent/5"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        {errors.propertyType && (
                          <p className={errorClass}>{errors.propertyType}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            المساحة (م²) <span className="text-destructive">*</span>
                          </label>
                          <input
                            value={form.area}
                            onChange={(e) => update("area", e.target.value)}
                            placeholder="مثال: 150"
                            className={inputClass}
                          />
                          {errors.area && <p className={errorClass}>{errors.area}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            عدد الطوابق
                          </label>
                          <input
                            value={form.floors}
                            onChange={(e) => update("floors", e.target.value)}
                            placeholder="مثال: 2"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          الموقع <span className="text-destructive">*</span>
                        </label>
                        <input
                          value={form.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="مثال: التجمع الخامس، القاهرة الجديدة"
                          className={inputClass}
                        />
                        {errors.location && (
                          <p className={errorClass}>{errors.location}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Services */}
                  {step === 2 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        اختر الخدمات التي تحتاجها (يمكنك اختيار أكثر من خدمة)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {serviceOptions.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleService(s)}
                            className={`p-4 rounded-xl text-sm font-medium text-right transition-all flex items-center gap-3 ${
                              form.services.includes(s)
                                ? "bg-accent/10 border-2 border-accent text-primary"
                                : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-accent/5"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                form.services.includes(s)
                                  ? "border-accent bg-accent"
                                  : "border-border"
                              }`}
                            >
                              {form.services.includes(s) && (
                                <span className="text-accent-foreground text-xs">✓</span>
                              )}
                            </div>
                            {s}
                          </button>
                        ))}
                      </div>
                      {errors.services && (
                        <p className={`${errorClass} mt-3 flex items-center gap-1`}>
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.services}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Budget */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          الميزانية التقريبية
                        </label>
                        <div className="space-y-2">
                          {budgetOptions.map((b) => (
                            <button
                              key={b}
                              onClick={() => update("budget", b)}
                              className={`w-full p-4 rounded-xl text-sm font-medium text-right transition-all flex items-center gap-3 ${
                                form.budget === b
                                  ? "bg-accent/10 border-2 border-accent text-primary"
                                  : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-accent/5"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  form.budget === b
                                    ? "border-accent"
                                    : "border-border"
                                }`}
                              >
                                {form.budget === b && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                )}
                              </div>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          ملاحظات إضافية
                        </label>
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => update("notes", e.target.value)}
                          placeholder="أي تفاصيل إضافية تود مشاركتها معنا..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="bg-muted rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-primary mb-3">
                          معلوماتك الأساسية
                        </h3>
                        {[
                          { label: "الاسم", value: form.name },
                          { label: "الهاتف", value: form.phone },
                          { label: "البريد", value: form.email },
                        ].map((f) => (
                          <div key={f.label} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{f.label}</span>
                            <span className="font-medium text-primary">
                              {f.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-muted rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-primary mb-3">
                          تفاصيل العقار
                        </h3>
                        {[
                          { label: "النوع", value: form.propertyType },
                          { label: "المساحة", value: form.area ? `${form.area} م²` : "—" },
                          { label: "الموقع", value: form.location },
                          { label: "الطوابق", value: form.floors },
                          { label: "الميزانية", value: form.budget },
                        ].map((f) => (
                          <div key={f.label} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{f.label}</span>
                            <span className="font-medium text-primary">
                              {f.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {form.services.length > 0 && (
                        <div className="bg-muted rounded-xl p-5">
                          <h3 className="text-sm font-bold text-primary mb-3">
                            الخدمات المطلوبة
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {form.services.map((s) => (
                              <span
                                key={s}
                                className="bg-accent/10 text-accent text-xs font-bold px-3 py-1.5 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {form.notes && (
                        <div className="bg-muted rounded-xl p-5">
                          <h3 className="text-sm font-bold text-primary mb-2">
                            ملاحظات
                          </h3>
                          <p className="text-sm text-muted-foreground">{form.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-border">
                {step > 0 ? (
                  <Button variant="outline" size="lg" onClick={prev}>
                    <ArrowRight className="w-4 h-4" /> السابق
                  </Button>
                ) : (
                  <div />
                )}
                {step < steps.length - 1 ? (
                  <Button variant="gold" size="lg" onClick={next}>
                    التالي <ArrowLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={submit}
                    disabled={loading}
                    className="min-w-[140px]"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>إرسال الطلب</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default QuotePage;
