import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles, CheckCircle2, Send, Info, TrendingUp } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  SCOPES,
  TIER_MULT,
  PROPERTY_TYPES,
  type PropertyType,
  type QualityTier,
  calculateEstimate,
  formatEGP,
} from "@/lib/calculator";

const CalculatorPage = () => {
  const { t, lang } = useLanguage();

  const [area, setArea] = useState(150);
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [floors, setFloors] = useState(1);
  const [tier, setTier] = useState<QualityTier>("standard");
  const [selected, setSelected] = useState<string[]>(SCOPES.map((s) => s.id));
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const result = useMemo(
    () => calculateEstimate({ area, propertyType, floors, tier, scopes: selected }),
    [area, propertyType, floors, tier, selected]
  );

  const toggleScope = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(t("calc.errNameRequired"));
      return;
    }
    if (selected.length === 0) {
      toast.error(t("calc.errPickScope"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("cost_estimates").insert({
      area,
      property_type: propertyType,
      floors,
      quality_tier: tier,
      selected_scopes: selected,
      estimated_min: result.min,
      estimated_max: result.max,
      contact_name: name.trim(),
      contact_phone: phone.trim(),
      contact_email: email.trim() || null,
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("calc.errSubmit"));
      return;
    }
    toast.success(t("calc.successTitle"), { description: t("calc.successDesc") });
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--accent))_0%,_transparent_45%),radial-gradient(circle_at_80%_80%,_hsl(var(--accent))_0%,_transparent_45%)]" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="bg-accent text-accent-foreground mb-4">
              <Sparkles className="w-3.5 h-3.5 me-1" /> {t("calc.badge")}
            </Badge>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">{t("calc.heroTitle")}</h1>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">{t("calc.heroDesc")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Inputs */}
          <Card className="lg:col-span-3 p-6 md:p-8 space-y-6 shadow-elegant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold">{t("calc.inputsTitle")}</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("calc.area")}</Label>
                <Input
                  type="number"
                  min={20}
                  max={5000}
                  value={area}
                  onChange={(e) => setArea(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("calc.propertyType")}</Label>
                <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>{t(`property.${pt}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>{t("calc.floors")}</Label>
                <span className="text-sm font-bold text-accent">{floors}</span>
              </div>
              <Slider value={[floors]} min={1} max={5} step={1} onValueChange={(v) => setFloors(v[0])} />
            </div>

            <div className="space-y-3">
              <Label>{t("calc.tier")}</Label>
              <Tabs value={tier} onValueChange={(v) => setTier(v as QualityTier)}>
                <TabsList className="grid grid-cols-3 w-full">
                  {(Object.keys(TIER_MULT) as QualityTier[]).map((q) => (
                    <TabsTrigger key={q} value={q}>{t(`calc.tier.${q}`)}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {t(`calc.tier.${tier}.desc`)}
              </p>
            </div>

            <div className="space-y-3">
              <Label>{t("calc.scopes")}</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {SCOPES.map((s) => {
                  const active = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleScope(s.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-start transition-all ${
                        active ? "border-accent bg-accent/5 ring-1 ring-accent/30" : "border-border hover:border-accent/50"
                      }`}
                    >
                      <Checkbox checked={active} className="mt-0.5 pointer-events-none" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{t(`calc.scope.${s.id}`)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatEGP(s.rate, lang)} / م²
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-heading text-lg font-bold">{t("calc.contactTitle")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("calc.name")} *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("calc.namePh")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("calc.phone")} *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("calc.email")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label>{t("calc.notes")}</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("calc.notesPh")} />
              </div>
              <Button variant="gold" size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
                <Send className="w-4 h-4" />
                {submitting ? t("calc.sending") : t("calc.submit")}
              </Button>
            </div>
          </Card>

          {/* Result */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-2xl">
              <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-widest mb-3">
                <TrendingUp className="w-4 h-4" />
                {t("calc.estimateLabel")}
              </div>
              <div className="space-y-1 mb-6">
                <div className="text-3xl md:text-5xl font-bold font-heading">
                  {formatEGP(result.min, lang)}
                </div>
                <div className="text-sm opacity-80">— {formatEGP(result.max, lang)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="opacity-70 text-xs mb-1">{t("calc.perSqm")}</div>
                  <div className="font-bold">{formatEGP(result.pricePerSqm, lang)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="opacity-70 text-xs mb-1">{t("calc.totalArea")}</div>
                  <div className="font-bold">{area} م²</div>
                </div>
              </div>
              <p className="text-xs opacity-70 mt-4 leading-relaxed">
                <Info className="w-3 h-3 inline me-1" />
                {t("calc.disclaimer")}
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t("calc.breakdown")}
              </h3>
              {result.lines.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("calc.noScope")}</p>
              ) : (
                <ul className="space-y-2">
                  {result.lines.map((l) => (
                    <li key={l.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                      <span>{t(`calc.scope.${l.id}`)}</span>
                      <span className="font-bold tabular-nums">{formatEGP(l.cost, lang)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Sample products by selected scope */}
      {result.lines.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-3">{t("calc.transparencyBadge")}</Badge>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">{t("calc.transparencyTitle")}</h2>
              <p className="text-muted-foreground text-sm md:text-base">{t("calc.transparencyDesc")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.lines.map((l) => (
                <Card key={l.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-bold text-base">{t(`calc.scope.${l.id}`)}</h3>
                    <Badge variant="outline" className="text-xs">{formatEGP(l.rate, lang)} / م²</Badge>
                  </div>
                  {l.samples.length === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {l.samples.map((p, idx) => (
                        <li key={idx} className="flex justify-between items-start gap-2 text-xs border-b border-border/40 pb-1.5 last:border-0">
                          <span className="line-clamp-2 leading-snug" title={p.n}>{p.n}</span>
                          <span className="font-bold text-accent shrink-0 tabular-nums">{formatEGP(p.p, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default CalculatorPage;
