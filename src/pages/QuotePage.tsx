import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const steps = ["معلومات أساسية", "تفاصيل العقار", "الخدمات المطلوبة", "الميزانية", "المراجعة"];

const serviceOptions = [
  "التعديلات الإنشائية", "التشطيبات المعمارية", "أعمال الجبس والديكور",
  "النجارة والمطابخ", "التسليم النهائي", "استشارات هندسية",
];

const QuotePage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    propertyType: "", area: "", location: "", floors: "",
    services: [] as string[],
    budget: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string | string[]) => setForm((p) => ({ ...p, [field]: value }));

  const toggleService = (s: string) => {
    const arr = form.services.includes(s) ? form.services.filter((x) => x !== s) : [...form.services, s];
    update("services", arr);
  };

  const next = () => { if (step < steps.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };
  const submit = () => setSubmitted(true);

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all";

  if (submitted) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="pt-32 pb-20">
          <div className="container-custom max-w-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl p-12 shadow-card text-center">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-primary mb-4">تم إرسال طلبك بنجاح!</h2>
              <p className="text-muted-foreground">سيتواصل معك فريقنا خلال 24 ساعة لتقديم عرض السعر.</p>
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
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              طلب عرض سعر
            </motion.h1>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom max-w-2xl">
            {/* Progress */}
            <div className="flex items-center justify-between mb-12">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && <div className={`w-8 md:w-16 h-px mx-1 ${i < step ? "bg-accent" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-8 shadow-card">
              <h2 className="text-xl font-bold text-primary mb-6">{steps[step]}</h2>

              {step === 0 && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">الاسم الكامل</label><input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium mb-1">رقم الجوال</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" className={inputClass} /></div>
                  <div><label className="block text-sm font-medium mb-1">البريد الإلكتروني</label><input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className={inputClass} /></div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">نوع العقار</label>
                    <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
                      <option value="">اختر</option><option value="شقة">شقة</option><option value="فيلا">فيلا</option><option value="دوبلكس">دوبلكس</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">المساحة (م²)</label><input value={form.area} onChange={(e) => update("area", e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium mb-1">الموقع</label><input value={form.location} onChange={(e) => update("location", e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-sm font-medium mb-1">عدد الطوابق</label><input value={form.floors} onChange={(e) => update("floors", e.target.value)} className={inputClass} /></div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`p-4 rounded-lg text-sm font-medium text-right transition-all ${
                        form.services.includes(s) ? "bg-accent/10 border-2 border-accent text-primary" : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-accent/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الميزانية التقريبية</label>
                    <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                      <option value="">اختر</option>
                      <option value="أقل من 100,000">أقل من 100,000 جنيه</option>
                      <option value="100,000 - 300,000">100,000 - 300,000 جنيه</option>
                      <option value="300,000 - 500,000">300,000 - 500,000 جنيه</option>
                      <option value="أكثر من 500,000">أكثر من 500,000 جنيه</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">ملاحظات إضافية</label><textarea rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} className={`${inputClass} resize-none`} /></div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "الاسم", value: form.name },
                      { label: "الجوال", value: form.phone },
                      { label: "البريد", value: form.email },
                      { label: "نوع العقار", value: form.propertyType },
                      { label: "المساحة", value: form.area },
                      { label: "الموقع", value: form.location },
                      { label: "الميزانية", value: form.budget },
                    ].map((f) => (
                      <div key={f.label}>
                        <span className="text-muted-foreground">{f.label}:</span>
                        <span className="font-bold text-primary mr-2">{f.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                  {form.services.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">الخدمات:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.services.map((s) => (
                          <span key={s} className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 0 ? (
                  <Button variant="outline" onClick={prev}><ArrowRight className="w-4 h-4" /> السابق</Button>
                ) : <div />}
                {step < steps.length - 1 ? (
                  <Button variant="gold" onClick={next}>التالي <ArrowLeft className="w-4 h-4" /></Button>
                ) : (
                  <Button variant="gold" onClick={submit}>إرسال الطلب</Button>
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
