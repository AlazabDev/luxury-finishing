import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", propertyType: "", area: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const contactSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(1).max(20),
    propertyType: z.string().min(1),
    area: z.string().max(50).optional(),
    message: z.string().trim().min(1).max(1000),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const contactCards = [
    { icon: Phone, label: t("contact.phone"), value: "+201004006620", href: "tel:+201004006620" },
    { icon: Mail, label: t("contact.email"), value: "brand.identity@alazab.com", href: "mailto:brand.identity@alazab.com" },
    { icon: MapPin, label: t("contact.address"), value: t("contact.addressValue"), href: "#" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative pt-32 pb-20 bg-primary">
          <div className="container-custom">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("contact.heroTitle")}
            </motion.h1>
            <p className="text-primary-foreground/70 text-lg">{t("contact.desc")}</p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {contactCards.map((c) => (
                <a key={c.label} href={c.href} className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                    <div className="font-bold text-primary text-sm">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                {submitted ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-12 shadow-card text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-4">{t("contact.success")}</h2>
                    <p className="text-muted-foreground">{t("contact.successDesc")}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-card space-y-5">
                    <h2 className="text-2xl font-bold text-primary mb-6">{t("contact.sendMessage")}</h2>
                    {[
                      { name: "name", label: t("contact.fullName"), type: "text" },
                      { name: "email", label: t("contact.emailLabel"), type: "email" },
                      { name: "phone", label: t("contact.phoneLabel"), type: "tel" },
                    ].map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-foreground mb-1">{f.label}</label>
                        <input type={f.type} value={form[f.name as keyof typeof form]} onChange={(e) => update(f.name, e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all" />
                        {errors[f.name] && <span className="text-xs text-destructive mt-1">{errors[f.name]}</span>}
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t("contact.propertyType")}</label>
                      <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all">
                        <option value="">{t("contact.selectProperty")}</option>
                        <option value="apartment">{t("contact.apartment")}</option>
                        <option value="villa">{t("contact.villa")}</option>
                        <option value="duplex">{t("contact.duplex")}</option>
                        <option value="other">{t("contact.other")}</option>
                      </select>
                      {errors.propertyType && <span className="text-xs text-destructive mt-1">{errors.propertyType}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t("contact.area")}</label>
                      <input type="text" value={form.area} onChange={(e) => update("area", e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t("contact.message")}</label>
                      <textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none" />
                      {errors.message && <span className="text-xs text-destructive mt-1">{errors.message}</span>}
                    </div>
                    <Button type="submit" variant="gold" size="lg" className="w-full py-6">{t("contact.submit")}</Button>
                  </form>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl overflow-hidden shadow-card">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.771324907652!2d31.278762925568998!3d29.987812974952135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458396627ebf27d%3A0x15bc48a54f2e9a92!2z2KfZhNi52LLYqCDZhNmE2YXZgtin2YjZhNin2Kog2YjYp9mE2KrZiNix2YrYr9in2Ko!5e1!3m2!1sar!2seg!4v1773443057660!5m2!1sar!2seg"
                    width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={t("contact.ourLocation")}
                  />
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-accent" />
                    <h3 className="font-bold text-primary">{t("contact.workingHours")}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>{t("contact.satThu")}</span><span>9:00 - 6:00</span></div>
                    <div className="flex justify-between"><span>{t("contact.friday")}</span><span>{t("contact.closed")}</span></div>
                  </div>
                </div>
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

export default ContactPage;
