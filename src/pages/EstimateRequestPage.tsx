import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Send,
  Sparkles,
  Calculator as CalcIcon,
  Info,
  CheckCircle2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const MAX_FILES = 8;
const MAX_FILE_MB = 15;
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.dwg,.dxf,.doc,.docx,.zip";

interface PendingFile {
  file: File;
  id: string;
}

const EstimateRequestPage = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  // basic data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [area, setArea] = useState<number | "">(150);
  const [floors, setFloors] = useState(1);
  const [tier, setTier] = useState<QualityTier>("standard");
  const [selected, setSelected] = useState<string[]>(
    SCOPES.map((s) => s.id)
  );
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(
    () =>
      calculateEstimate({
        area: typeof area === "number" ? area : 0,
        propertyType,
        floors,
        tier,
        scopes: selected,
      }),
    [area, propertyType, floors, tier, selected]
  );

  const toggleScope = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((s) => s !== id) : [...p, id]
    );

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: PendingFile[] = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        toast.error(t("er.errTooManyFiles"));
        break;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name}: ${t("er.errFileTooBig")}`);
        continue;
      }
      next.push({ file: f, id: crypto.randomUUID() });
    }
    setFiles(next);
  };

  const removeFile = (id: string) =>
    setFiles((p) => p.filter((f) => f.id !== id));

  const uploadAll = async (
    requestId: string
  ): Promise<{ name: string; path: string; url: string; size: number; type: string }[]> => {
    const uploaded: {
      name: string;
      path: string;
      url: string;
      size: number;
      type: string;
    }[] = [];
    for (const { file } of files) {
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `estimate-requests/${requestId}/${Date.now()}_${safe}`;
      const { error } = await supabase.storage
        .from("luxury-finishing")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
      if (error) throw error;
      const { data } = supabase.storage
        .from("luxury-finishing")
        .getPublicUrl(path);
      uploaded.push({
        name: file.name,
        path,
        url: data.publicUrl,
        size: file.size,
        type: file.type,
      });
    }
    return uploaded;
  };

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
    try {
      const requestId = crypto.randomUUID();
      let attachments: Awaited<ReturnType<typeof uploadAll>> = [];
      if (files.length > 0) {
        try {
          attachments = await uploadAll(requestId);
        } catch (e) {
          console.error(e);
          toast.error(t("er.errUpload"));
          setSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("estimate_requests").insert({
        id: requestId,
        contact_name: name.trim(),
        contact_phone: phone.trim(),
        contact_email: email.trim() || null,
        property_type: propertyType,
        area: typeof area === "number" ? area : null,
        floors,
        quality_tier: tier,
        selected_scopes: selected,
        message: message.trim() || null,
        attachments: attachments as unknown as never,
        estimated_min: preview.min || null,
        estimated_max: preview.max || null,
      });
      if (error) throw error;

      toast.success(t("er.successTitle"), {
        description: t("er.successDesc"),
      });
      // Reset
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setFiles([]);
      // Forward to calculator with prefilled data for full breakdown
      setTimeout(() => navigate("/calculator"), 1200);
    } catch (e) {
      console.error(e);
      toast.error(t("calc.errSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--accent))_0%,_transparent_45%),radial-gradient(circle_at_80%_80%,_hsl(var(--accent))_0%,_transparent_45%)]" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge className="bg-accent text-accent-foreground mb-4">
              <Sparkles className="w-3.5 h-3.5 me-1" /> {t("er.badge")}
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t("er.heroTitle")}
            </h1>
            <p className="text-base md:text-lg opacity-90 leading-relaxed">
              {t("er.heroDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Form */}
          <Card className="lg:col-span-3 p-6 md:p-8 space-y-8 shadow-elegant">
            {/* Step 1 */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                  1
                </div>
                <h2 className="font-heading text-lg md:text-xl font-bold">
                  {t("er.step1Title")}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("calc.name")} *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("calc.namePh")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("calc.phone")} *</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("calc.email")}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-5 border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                  2
                </div>
                <h2 className="font-heading text-lg md:text-xl font-bold">
                  {t("er.step2Title")}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("calc.propertyType")}</Label>
                  <Select
                    value={propertyType}
                    onValueChange={(v) => setPropertyType(v as PropertyType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((pt) => (
                        <SelectItem key={pt} value={pt}>
                          {t(`property.${pt}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("calc.area")}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5000}
                    value={area}
                    onChange={(e) =>
                      setArea(
                        e.target.value === ""
                          ? ""
                          : Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>{t("calc.floors")}</Label>
                  <span className="text-sm font-bold text-accent">
                    {floors}
                  </span>
                </div>
                <Slider
                  value={[floors]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(v) => setFloors(v[0])}
                />
              </div>
              <div className="space-y-3">
                <Label>{t("calc.tier")}</Label>
                <Tabs
                  value={tier}
                  onValueChange={(v) => setTier(v as QualityTier)}
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    {(Object.keys(TIER_MULT) as QualityTier[]).map((q) => (
                      <TabsTrigger key={q} value={q}>
                        {t(`calc.tier.${q}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
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
                          active
                            ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <Checkbox
                          checked={active}
                          className="mt-0.5 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {t(`calc.scope.${s.id}`)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3 — Attachments */}
            <div className="space-y-5 border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                  3
                </div>
                <h2 className="font-heading text-lg md:text-xl font-bold">
                  {t("er.step3Title")}
                </h2>
              </div>

              <label
                htmlFor="er-file-input"
                className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-accent/60 hover:bg-accent/5 transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <div className="font-semibold text-sm">
                  {t("er.uploadCta")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("er.uploadHint")}
                </div>
                <input
                  id="er-file-input"
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {files.length > 0 && (
                <ul className="space-y-2">
                  {files.map((f) => {
                    const isImg = f.file.type.startsWith("image/");
                    return (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="w-9 h-9 rounded-md bg-background border flex items-center justify-center text-muted-foreground shrink-0">
                          {isImg ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {f.file.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(f.file.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(f.id)}
                          aria-label="remove"
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="space-y-2">
                <Label>{t("er.messageLabel")}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("er.messagePh")}
                  rows={4}
                  maxLength={1500}
                />
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send className="w-4 h-4" />
              {submitting ? t("calc.sending") : t("er.submit")}
            </Button>
          </Card>

          {/* Sidebar — live estimate preview + info */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">
            <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-2xl">
              <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-widest mb-3">
                <CalcIcon className="w-4 h-4" />
                {t("er.previewLabel")}
              </div>
              <div className="space-y-1 mb-4">
                <div className="text-3xl md:text-4xl font-bold font-heading">
                  {formatEGP(preview.min, lang)}
                </div>
                <div className="text-sm opacity-80">
                  — {formatEGP(preview.max, lang)}
                </div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                <Info className="w-3 h-3 inline me-1" />
                {t("er.previewNote")}
              </p>
              <Link
                to="/calculator"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                {t("er.fullCalculator")} →
              </Link>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-heading font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t("er.whyTitle")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  {t("er.why1")}
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  {t("er.why2")}
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  {t("er.why3")}
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default EstimateRequestPage;
