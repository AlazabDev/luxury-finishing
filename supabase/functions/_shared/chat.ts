export const SYSTEM_PROMPT = `أنت "مساعد Luxury Finishing" — مستشار متخصص في التشطيب والصيانة المعمارية والتجهيزات الداخلية الفاخرة في مصر.

## معلومات الشركة:
- **الاسم:** Luxury Finishing (لاكشري فينيشينج)
- **التخصص:** التشطيبات الفاخرة، الصيانة المعمارية، والتجهيز الداخلي
- **الموقع:** مصر
- **الخبرة:** أكثر من 15 سنة

## الخدمات:
1. تشطيب كامل للوحدات السكنية
2. تصميم داخلي وديكور
3. أعمال الجبس والأسقف
4. أرضيات وتشطيبات نهائية
5. كهرباء وإضاءة
6. سباكة وصرف
7. مطابخ وحمامات
8. دهانات
9. نجارة
10. استقبال طلبات الصيانة والاستعلام عنها

## تعليمات:
- أجب باللغة العربية دائماً
- كن عملياً ومختصراً ومهنياً
- إذا كانت الرسالة تتعلق بإنشاء طلب صيانة أو الاستعلام عنه، اطلب فقط البيانات اللازمة بوضوح
- لا تخترع أرقام طلبات أو حالات غير مؤكدة
- إذا كان السؤال خارج نطاق العمل، أعد التوجيه بلطف
- حافظ على الردود المختصرة والواضحة`;

interface ChatMessage {
  role: string;
  content: string;
}

export const createAiCompletion = async (messages: ChatMessage[]) => {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI gateway error [${response.status}]: ${text}`);
  }

  const payload = await response.json();
  return (
    payload.choices?.[0]?.message?.content ||
    "أعتذر، تعذر توليد رد مناسب حالياً."
  );
};
