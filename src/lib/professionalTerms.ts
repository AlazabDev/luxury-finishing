import type { LegalLocale, LegalSection } from "./legal";

interface LocalizedString {
  ar: string;
  en: string;
}

interface LocalizedLegalSection {
  title: LocalizedString;
  body: LocalizedString[];
  bullets?: LocalizedString[];
}

export const professionalTermsLastUpdated = "2026-09-27";

const sections: LocalizedLegalSection[] = [
  {
    title: { ar: "بدء الأعمال", en: "Commencement Of Work" },
    body: [
      {
        ar: "يتم بدء الأعمال مباشرة بعد الحصول على اعتماد صريح من العميل على نطاق العمل أو العرض المقدم، ويُعد هذا الاعتماد تفويضًا بالبدء في إجراءات التنفيذ والتوريد والتجهيز والتنسيق وفقًا لما تم اعتماده.",
        en: "Work shall commence immediately upon receiving the client's explicit approval of the agreed scope of work or commercial proposal. Such approval shall be considered authorization to proceed with execution, procurement, preparation, and coordination in accordance with the approved requirements.",
      },
      {
        ar: "يتم تنفيذ الأعمال طبقًا للمواصفات والرسومات والعينات ونطاق العمل المعتمد، مع الحفاظ على التنسيق المستمر مع العميل طوال مراحل التنفيذ.",
        en: "All works shall be carried out in line with the approved specifications, drawings, samples, and agreed scope, with continuous coordination maintained throughout the project.",
      },
    ],
  },
  {
    title: { ar: "التعديلات والأعمال الإضافية", en: "Variations & Additional Works" },
    body: [
      {
        ar: "أي تعديل أو إضافة يطلبها العميل بعد بدء التنفيذ يتم التعامل معها باعتبارها امتدادًا لنطاق العمل المعتمد.",
        en: "Any variation, addition, or change requested by the client after commencement shall be treated as an extension to the approved scope.",
      },
      {
        ar: "عندما يكون للتغيير أثر جوهري على التكلفة أو المواصفات أو مدة التنفيذ، يتم توضيح الأثر قبل التنفيذ متى كان ذلك قابلًا للتطبيق.",
        en: "Where such changes materially affect cost, specifications, or completion time, the impact shall be clearly communicated before implementation whenever applicable.",
      },
    ],
  },
  {
    title: { ar: "الأسعار", en: "Pricing" },
    body: [
      {
        ar: "تعتمد الأسعار على نطاق العمل والمواصفات والكميات المعتمدة، وأي تغيير جوهري في الكميات أو المواصفات قد يستلزم إعادة تقييم البند المتأثر فقط.",
        en: "Prices are based on the approved scope, specifications, and quantities. Any material change in quantities or specifications may require reassessment of the affected item only.",
      },
    ],
  },
  {
    title: { ar: "الدفعات ووسائل السداد", en: "Payment Terms" },
    body: [
      {
        ar: "توفر العزب مرونة في أساليب وآليات السداد بما يتناسب مع طبيعة كل عميل وكل مشروع، ويتم اختيار طريقة السداد بالتنسيق مع العميل بما يحقق السهولة والوضوح واستمرارية التنفيذ.",
        en: "Alazab provides flexible payment arrangements tailored to the nature of each client and project. Payment methods and settlement mechanisms may be selected in coordination with the client to ensure convenience, clarity, and smooth project execution.",
      },
      {
        ar: "لا تقوم سياسة العمل مع العملاء المحترفين على فرض نمط موحد للسداد، وإنما على الثقة المتبادلة والشفافية ووضوح الالتزامات واستمرارية العلاقة المهنية. وتتم تسوية المستحقات وفق الآلية المتفق عليها مع توثيق الأعمال والتوريدات والخدمات المنفذة بصورة واضحة ومنظمة.",
        en: "Our professional-client policy is not based on imposing rigid payment structures. It is built on mutual trust, transparency, clear obligations, and long-term professional relationships. Financial settlements are handled in accordance with the agreed mechanism, with completed works, supplied materials, and services clearly documented.",
      },
    ],
  },
  {
    title: { ar: "الاعتمادات", en: "Approvals" },
    body: [
      {
        ar: "تُعتبر المواد والتشطيبات والألوان والعينات والمواصفات معتمدة بعد موافقة العميل عليها بشكل صريح من خلال وسيلة التواصل الرسمية المعتمدة للمشروع.",
        en: "Materials, finishes, colors, samples, and technical specifications shall be considered approved once the client provides explicit confirmation through an authorized communication channel.",
      },
    ],
  },
  {
    title: { ar: "البرنامج الزمني", en: "Project Schedule" },
    body: [
      {
        ar: "يتم تحديد البرنامج الزمني طبقًا لطبيعة المشروع ومدى جاهزية الموقع وتوافر المواد والاعتمادات المطلوبة، ويتم إخطار العميل بأي متغير جوهري قد يؤثر فعليًا على مدة التنفيذ.",
        en: "The execution schedule is determined based on project requirements, site readiness, material availability, and required approvals. The client shall be informed of any significant development that may materially affect the agreed timeline.",
      },
    ],
  },
  {
    title: { ar: "الضمان", en: "Warranty" },
    body: [
      {
        ar: "يشمل الضمان العيوب الناتجة عن التنفيذ أو المواد التي قامت العزب بتوريدها خلال فترة الضمان المتفق عليها، ولا يشمل التلف الناتج عن سوء الاستخدام أو تدخل أطراف أخرى أو الاستهلاك الطبيعي أو الظروف الخارجة عن نطاق الأعمال المنفذة.",
        en: "Warranty coverage applies to defects resulting from workmanship or materials supplied by Alazab during the agreed warranty period. It does not cover damage caused by misuse, third-party intervention, normal wear and tear, or circumstances beyond the scope of the executed works.",
      },
    ],
  },
  {
    title: { ar: "أنظمة المراقبة والحماية — ما بعد التركيب", en: "Security & Surveillance Systems — Beyond Installation" },
    body: [
      {
        ar: "لا يقتصر دور العزب في أنظمة المراقبة والحماية على توريد الأجهزة وتركيبها وتشغيلها. عند اعتماد وتنفيذ نظام من خلال العزب، وحيثما تسمح البنية الفنية للأجهزة، يمكن ربط مكونات النظام بمنصة المتابعة الفنية الخاصة بالعزب بهدف متابعة الحالة التشغيلية والصحة الفنية للنظام.",
        en: "At Alazab, our role in surveillance and security systems does not end with supplying, installing, and commissioning equipment. When a system is approved and implemented by Alazab, and where the technical architecture permits, system components may be connected to Alazab's technical monitoring infrastructure to monitor operational health and technical status.",
      },
      {
        ar: "هذا الربط لا يعني التدخل في أعمال المراقبة الخاصة بالعميل أو الاطلاع غير المصرح به على التسجيلات أو المشاهد الحية؛ فالهدف هو مراقبة جاهزية النظام واستمرارية عمل مكوناته الفنية.",
        en: "This connection does not constitute interference with the client's surveillance activities or unauthorized access to recordings or live footage. Its purpose is to maintain system readiness and technical continuity.",
      },
    ],
    bullets: [
      { ar: "حالة اتصال الكاميرات والأجهزة", en: "Camera and device connectivity status" },
      { ar: "حالة أجهزة NVR وDVR ووحدات التسجيل", en: "NVR, DVR, and recording-device status" },
      { ar: "استمرارية التسجيل واكتشاف أخطاء التسجيل", en: "Recording continuity and recording-failure detection" },
      { ar: "حالة وحدات التخزين والأقراص والسعة المتاحة", en: "Storage, disk health, and available capacity" },
      { ar: "حالة الشبكة والاتصال بين مكونات النظام", en: "Network and inter-device connectivity" },
      { ar: "حالة الطاقة أو مصادر الطاقة الاحتياطية عند توفر البيانات", en: "Power and backup-power status where supported" },
      { ar: "درجة حرارة الأجهزة وحالتها الفنية عند دعمها", en: "Device temperature and technical health where supported" },
      { ar: "الاتصال بالسيرفرات والخدمات الأساسية", en: "Server and core-service connectivity" },
      { ar: "التنبيهات والأخطاء الفنية الصادرة عن الأجهزة", en: "System-generated technical alerts and faults" },
    ],
  },
  {
    title: { ar: "التنبيهات الاستباقية والدعم الوقائي", en: "Proactive Alerts & Preventive Support" },
    body: [
      {
        ar: "عند اكتشاف خلل أو فقد اتصال أو حالة غير طبيعية أو تحذير فني، يمكن استقبال التنبيه داخل أنظمة العزب بما يسمح للفريق الفني بتحديد المشكلة ومتابعتها قبل أن تتطور إلى عطل كامل في منظومة الحماية.",
        en: "When a fault, disconnection, abnormal condition, or technical warning is detected, an alert may be received through Alazab's monitoring infrastructure, allowing the technical team to identify and follow up on potential issues before they develop into a complete system failure.",
      },
      {
        ar: "وبذلك تنتقل الخدمة من مجرد التركيب إلى منظومة متكاملة تشمل التركيب والمتابعة التشغيلية والدعم الوقائي واستمرارية الجاهزية.",
        en: "The service therefore moves beyond installation only toward an integrated model of installation, monitoring, preventive support, and continuous operational readiness.",
      },
    ],
  },
  {
    title: { ar: "صحة النظام وليست محتوى المراقبة", en: "System Health, Not Surveillance Content" },
    body: [
      {
        ar: "تركز العزب على صحة النظام والأجهزة والاتصال والتسجيل والتخزين والأداء الفني العام، وليس على محتوى المراقبة الخاص بالعميل.",
        en: "Alazab monitors the health of the system, including device status, connectivity, recording continuity, storage condition, and overall technical performance — not the content of the surveillance.",
      },
      {
        ar: "تظل المشاهد الحية والتسجيلات وبيانات المراقبة تحت ملكية وسيطرة العميل، ولا يتم الوصول إلى محتوى المراقبة إلا عندما يتطلب الدعم الفني ذلك وبعد الحصول على التفويض المناسب من العميل.",
        en: "Live footage, recordings, and surveillance data remain under the ownership and control of the client. Alazab does not access surveillance content unless such access is required for technical support and has been appropriately authorized by the client.",
      },
    ],
  },
  {
    title: { ar: "استمرارية التشغيل", en: "Operational Continuity" },
    body: [
      {
        ar: "قد تبدو منظومة المراقبة عاملة بصورة طبيعية بينما تكون إحدى الكاميرات قد توقفت عن التسجيل، أو يكون أحد الأقراص قد تعطل، أو تكون السعة التخزينية قد امتلأت، أو يكون جهاز التسجيل قد فقد الاتصال. تساعد المتابعة الفنية على اكتشاف هذه الحالات مبكرًا واتخاذ الإجراء المناسب قبل أن تؤثر على موثوقية النظام.",
        en: "A surveillance system may appear to be operating normally while a camera has stopped recording, a hard drive has failed, storage capacity has been exhausted, or a recording device has lost connectivity. Technical monitoring enables these conditions to be identified earlier so corrective action can be taken before system reliability is compromised.",
      },
    ],
  },
  {
    title: { ar: "منظومة مدارة باحتراف", en: "Managed Surveillance & Security Systems" },
    body: [
      {
        ar: "في العزب، لا نقدم مجرد أنظمة وتركيبات، بل نبني حلولًا موثوقة ومدارة باحتراف، مصممة للأداء طويل المدى، واستمرارية التشغيل، وثقة العميل.",
        en: "At Alazab, we deliver more than systems and installations — we build reliable, professionally managed solutions designed for long-term performance, operational continuity, and lasting client confidence.",
      },
    ],
  },
];

export const getProfessionalTermsSections = (lang: LegalLocale): LegalSection[] =>
  sections.map((section) => ({
    title: section.title[lang],
    body: section.body.map((item) => item[lang]),
    bullets: section.bullets?.map((item) => item[lang]),
  }));
