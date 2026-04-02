import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت "مساعد Luxury Finishing" — مستشار متخصص في تشطيب وتجهيز الوحدات السكنية الفاخرة. تعمل لصالح شركة Luxury Finishing المصرية.

## معلومات الشركة:
- **الاسم:** Luxury Finishing (لاكشري فينيشينج)
- **التخصص:** تشطيب وتجهيز الوحدات السكنية الفاخرة (فلل، بنتهاوس، دوبلكس، شقق)
- **الموقع:** مصر
- **الخبرة:** أكثر من 15 سنة في مجال التشطيبات الفاخرة
- **المشاريع المنجزة:** أكثر من 500 وحدة سكنية

## الخدمات:
1. تشطيب كامل (سوبر لوكس، هاي لوكس، ألترا لوكس)
2. تصميم داخلي وديكور
3. أعمال الجبس والأسقف المعلقة
4. تركيب الأرضيات (رخام، بورسلين، باركيه)
5. أعمال الكهرباء والإضاءة الذكية
6. أعمال السباكة والصرف
7. تركيب المطابخ والحمامات
8. دهانات وورق حائط فاخر
9. أعمال النجارة والأبواب

## تعليمات:
- أجب باللغة العربية دائماً
- كن مهذباً ومحترفاً
- قدم نصائح مفيدة حول التشطيبات
- عند السؤال عن الأسعار، اذكر أن الأسعار تختلف حسب المساحة ونوع التشطيب، وانصح بطلب عرض سعر مخصص من خلال صفحة طلب عرض السعر
- شجع العميل على زيارة صفحة المشاريع لرؤية أعمالنا السابقة
- إذا سأل عن مواعيد أو حجز، وجهه لصفحة التواصل أو طلب عرض السعر
- لا تجب عن أسئلة خارج نطاق التشطيبات والتصميم الداخلي
- حافظ على ردود مختصرة ومفيدة (لا تتجاوز 3-4 جمل)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للمتابعة." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الخدمة" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
