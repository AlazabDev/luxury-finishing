export type LegalLocale = "ar" | "en";

interface LocalizedString {
  ar: string;
  en: string;
}

export interface LegalSection {
  title: string;
  body: string[];
  bullets?: string[];
}

export interface LegalLinkCard {
  title: string;
  href: string;
  description: string;
  badge: string;
}

export interface IntegrationComplianceCard {
  title: string;
  description: string;
  status: string;
}

export interface SocialChannelCard {
  title: string;
  handle: string;
  description: string;
  status: "live" | "ready" | "planned";
  audience: string;
}

const pick = (value: LocalizedString, lang: LegalLocale) => value[lang];

type LocalizedLegalLinkCard = Omit<LegalLinkCard, "title" | "description" | "badge"> & {
  title: LocalizedString;
  description: LocalizedString;
  badge: LocalizedString;
};

type LocalizedIntegrationComplianceCard = {
  title: LocalizedString;
  description: LocalizedString;
  status: LocalizedString;
};

type LocalizedLegalSection = {
  title: LocalizedString;
  body: LocalizedString[];
  bullets?: LocalizedString[];
};

type LocalizedSocialChannelCard = {
  title: LocalizedString;
  handle: LocalizedString;
  description: LocalizedString;
  status: "live" | "ready" | "planned";
  audience: LocalizedString;
};

export const legalLastUpdated = "2026-04-03";

const legalLinksLocalized: LocalizedLegalLinkCard[] = [
  {
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    href: "/privacy",
    description: {
      ar: "كيفية جمع البيانات الشخصية واستخدامها ومشاركتها وحمايتها.",
      en: "How personal data is collected, used, shared, and protected.",
    },
    badge: { ar: "أساسي", en: "Core" },
  },
  {
    title: { ar: "الشروط والأحكام", en: "Terms And Conditions" },
    href: "/terms",
    description: {
      ar: "إطار استخدام الموقع والخدمات والالتزامات النظامية.",
      en: "Rules for using the website, services, and operational obligations.",
    },
    badge: { ar: "تشغيلي", en: "Operational" },
  },
  {
    title: { ar: "سياسة ملفات الارتباط", en: "Cookie Policy" },
    href: "/cookies",
    description: {
      ar: "تفاصيل ملفات الارتباط وتقنيات القياس والتفضيلات.",
      en: "Cookie usage, measurement technologies, and preference handling.",
    },
    badge: { ar: "تقني", en: "Technical" },
  },
  {
    title: { ar: "حذف البيانات", en: "Data Deletion" },
    href: "/data-deletion",
    description: {
      ar: "قناة المستخدمين والأنظمة لطلب حذف البيانات أو تقليلها.",
      en: "A public route for requesting deletion or reduction of stored data.",
    },
    badge: { ar: "امتثال", en: "Compliance" },
  },
];

const complianceIntegrationsLocalized: LocalizedIntegrationComplianceCard[] = [
  {
    title: { ar: "ميتا وواتساب للأعمال", en: "Meta And WhatsApp Business" },
    description: {
      ar: "الصفحات القانونية والويبهوكات مهيأة لربط الإشعارات والتحقق وحذف البيانات.",
      en: "Legal pages and webhooks are prepared for notifications, verification, and data deletion flows.",
    },
    status: { ar: "جاهز للربط", en: "Ready For Integration" },
  },
  {
    title: { ar: "سوبابيس", en: "Supabase" },
    description: {
      ar: "البنية الخلفية ووظائف Edge Functions وسكرتات الإنتاج مهيأة للتشغيل.",
      en: "Backend infrastructure, Edge Functions, and production secrets are configured for operation.",
    },
    status: { ar: "مفعل", en: "Active" },
  },
  {
    title: { ar: "كلاوديناري", en: "Cloudinary" },
    description: {
      ar: "إدارة الأصول البصرية وتوليد روابط الصور في الإنتاج مفعلة ديناميكياً.",
      en: "Media delivery and production image URLs are enabled dynamically.",
    },
    status: { ar: "مفعل", en: "Active" },
  },
  {
    title: { ar: "سي فايل", en: "Seafile" },
    description: {
      ar: "مرفقات الشات تحفظ في مكتبة مستقلة وروابطها تعاد للنظام تلقائياً.",
      en: "Chat attachments are stored in a dedicated library and returned to the system automatically.",
    },
    status: { ar: "مفعل", en: "Active" },
  },
  {
    title: { ar: "إليفن لابس", en: "ElevenLabs" },
    description: {
      ar: "طبقة الصوت متاحة عند ضبط Agent ID والاعتمادات الخاصة بالمشروع.",
      en: "Voice capabilities are available once the agent id and related credentials are configured.",
    },
    status: { ar: "جاهز تشغيل", en: "Ready To Run" },
  },
  {
    title: { ar: "بريد المشروع", en: "Project Mail" },
    description: {
      ar: "البريد الرسمي للمشروع مثبت كهوية تشغيلية للتكاملات والإشعارات.",
      en: "The official project mailbox is configured as the operating identity for integrations and notifications.",
    },
    status: { ar: "مفعل", en: "Active" },
  },
];

const privacySectionsLocalized: LocalizedLegalSection[] = [
  {
    title: { ar: "نطاق البيانات التي نعالجها", en: "Scope Of Data Processing" },
    body: [
      {
        ar: "يعالج موقع لاكشري فينيشينج بيانات يقدمها المستخدم مباشرة مثل الاسم ورقم الهاتف والبريد الإلكتروني وبيانات الطلبات والاستفسارات وملفات المرفقات المرتبطة بخدمة التشطيب أو الصيانة.",
        en: "Luxury Finishing processes data provided directly by users such as name, phone number, email address, service requests, inquiries, and uploaded attachments related to finishing or maintenance services.",
      },
      {
        ar: "قد نعالج أيضاً بيانات تقنية أساسية مثل عنوان IP، نوع المتصفح، الجهاز، سجل التفاعل، ومعرفات الجلسات من أجل الأمان وتحسين الأداء وضمان استقرار التكاملات الرقمية.",
        en: "We may also process technical data such as IP address, browser type, device information, interaction logs, and session identifiers for security, performance improvement, and operational stability.",
      },
    ],
    bullets: [
      { ar: "بيانات التواصل والاستفسار", en: "Contact and inquiry data" },
      { ar: "بيانات طلبات عروض الأسعار والصيانة", en: "Quotation and maintenance request data" },
      { ar: "مرفقات المحادثة والملفات المرفوعة", en: "Chat attachments and uploaded files" },
      { ar: "بيانات تقنية وتشغيلية لازمة للأمن والجودة", en: "Technical and operational data required for security and quality" },
    ],
  },
  {
    title: { ar: "أغراض المعالجة", en: "Purposes Of Processing" },
    body: [
      {
        ar: "نستخدم البيانات لتقديم الخدمات، إنشاء طلبات الصيانة، متابعة حالات الطلبات، الرد على الاستفسارات، توثيق المحادثات، وتطوير جودة التجربة الرقمية للموقع.",
        en: "We use data to deliver services, create maintenance requests, track request status, answer inquiries, document conversations, and improve the digital experience of the website.",
      },
      {
        ar: "قد تستخدم البيانات كذلك لتشغيل الإشعارات النظامية عبر البريد أو واتساب للأعمال أو القنوات الرسمية الأخرى عند توفر موافقة المستخدم أو وجود أساس نظامي مناسب للخدمة.",
        en: "Data may also be used to operate system notifications through email, WhatsApp Business, or other official channels where user consent or another valid legal basis exists.",
      },
    ],
  },
  {
    title: { ar: "مقدمو الخدمات والتكاملات", en: "Service Providers And Integrations" },
    body: [
      {
        ar: "قد تتم معالجة بعض البيانات من خلال مزودي بنية تحتية أو تكاملات تشغيلية مرتبطة بالخدمة مثل سوبابيس وكلاوديناري وسي فايل وميتا وواتساب للأعمال وإليفن لابس وميجادو ومزودات تشغيل مماثلة.",
        en: "Some data may be processed through infrastructure providers or operational integrations such as Supabase, Cloudinary, Seafile, Meta, WhatsApp Business, ElevenLabs, Migadu, and similar service operators.",
      },
      {
        ar: "نقصر مشاركة البيانات على ما يلزم لتقديم الخدمة أو الأمان أو تشغيل الإشعارات أو حفظ المرفقات، ونعمل على تقليل البيانات المتبادلة قدر الإمكان.",
        en: "Data sharing is limited to what is necessary for service delivery, security, notifications, or attachment storage, and we aim to minimize exchanged data whenever possible.",
      },
    ],
  },
  {
    title: { ar: "الاحتفاظ والحماية", en: "Retention And Protection" },
    body: [
      {
        ar: "نحتفظ بالبيانات للمدة اللازمة لتقديم الخدمة، الالتزام التشغيلي، أو توثيق الطلبات والمتابعات، ثم نحذفها أو نقللها عندما لا تعود هناك حاجة مشروعة للاحتفاظ بها.",
        en: "We retain data for the period necessary to deliver the service, satisfy operational obligations, or document requests and follow-ups, then delete or reduce it when retention is no longer justified.",
      },
      {
        ar: "نستخدم ضوابط وصول وسكرتات بيئية وطبقات حماية تشغيلية للحد من الوصول غير المصرح به أو سوء الاستخدام أو الفقد غير المقصود.",
        en: "We use access controls, environment secrets, and operational safeguards to reduce unauthorized access, misuse, or accidental loss.",
      },
    ],
  },
  {
    title: { ar: "حقوق المستخدم", en: "User Rights" },
    body: [
      {
        ar: "يمكن للمستخدم طلب الوصول إلى بياناته أو تصحيحها أو حذفها أو تقليل استخدامها أو سحب الموافقات القابلة للسحب، وذلك ضمن الحدود التي يسمح بها النظام وطبيعة الخدمة.",
        en: "Users may request access to their data, correction, deletion, restricted use, or withdrawal of revocable consent within the limits allowed by law and by the nature of the service.",
      },
      {
        ar: "ترسل الطلبات المتعلقة بالخصوصية أو حذف البيانات إلى البريد التشغيلي الرسمي للمشروع أو عبر صفحة حذف البيانات المخصصة.",
        en: "Privacy and data deletion requests may be sent to the official project mailbox or through the dedicated data deletion page.",
      },
    ],
    bullets: [
      { ar: "الوصول إلى البيانات", en: "Access to data" },
      { ar: "التصحيح والتحديث", en: "Correction and updates" },
      { ar: "الحذف أو التقييد", en: "Deletion or restriction" },
      { ar: "الاعتراض على بعض الاستخدامات", en: "Objection to certain uses" },
      { ar: "طلب نسخة من السجل المتاح عند الإمكان", en: "Requesting an available record copy when possible" },
    ],
  },
];

const termsSectionsLocalized: LocalizedLegalSection[] = [
  {
    title: { ar: "استخدام الموقع والخدمات", en: "Use Of Website And Services" },
    body: [
      {
        ar: "يستخدم هذا الموقع لعرض خدمات التشطيب الفاخر والصيانة المعمارية والتواصل التجاري المرتبط بها. استخدامك للموقع يعني قبولك للاستخدام المشروع والمسؤول للخدمات المتاحة.",
        en: "This website is used to present luxury finishing services, architectural maintenance services, and related business communication. By using the site, you accept responsible and lawful use of the available services.",
      },
      {
        ar: "لا يجوز استخدام الموقع أو الشات بوت أو نماذج التواصل في إرسال بيانات مضللة أو مسيئة أو غير قانونية أو اختبارات إزعاج أو محاولات وصول غير مصرح بها.",
        en: "The website, chatbot, and communication forms must not be used for misleading, abusive, unlawful, spam-like, or unauthorized access attempts.",
      },
    ],
  },
  {
    title: { ar: "الطلبات والتقديرات", en: "Requests And Estimates" },
    body: [
      {
        ar: "أي عرض سعر أو تقدير أو رد أولي عبر الموقع يعد مؤشراً مبدئياً ولا يصبح التزاماً تنفيذياً نهائياً إلا بعد المراجعة الفنية والتأكيد التجاري والتعاقد الرسمي عند الحاجة.",
        en: "Any quotation, estimate, or initial response through the website is preliminary and does not become a final execution commitment until technical review, commercial confirmation, and formal contracting when required.",
      },
      {
        ar: "بيانات الصيانة أو الطلبات المرسلة عبر القنوات الرقمية تخضع للتحقق وقد يطلب فريق العمل معلومات إضافية قبل الاعتماد أو الجدولة أو الإسناد.",
        en: "Maintenance data or requests submitted through digital channels are subject to verification, and additional information may be requested before approval, scheduling, or assignment.",
      },
    ],
  },
  {
    title: { ar: "الملكية الفكرية والمحتوى", en: "Intellectual Property And Content" },
    body: [
      {
        ar: "جميع النصوص والمواد البصرية والهوية والعناصر البرمجية المرتبطة بالموقع مملوكة للمشروع أو مستخدمة بترخيص مناسب ولا يجوز نسخها أو إعادة استخدامها بشكل ينتهك الحقوق.",
        en: "All texts, visual materials, brand identity assets, and software elements related to the website are owned by the project or used under proper license and may not be copied or reused in a rights-violating manner.",
      },
      {
        ar: "أي ملفات أو رسائل يرسلها المستخدم عبر القنوات الرقمية يظل مسؤولاً عنها وعن قانونية امتلاكه لها وصحة صلاحية مشاركتها.",
        en: "Users remain responsible for any files or messages they send through digital channels, including legality of ownership and permission to share them.",
      },
    ],
  },
  {
    title: { ar: "التكاملات الخارجية", en: "External Integrations" },
    body: [
      {
        ar: "قد يعتمد الموقع على تكاملات خارجية لأغراض الإشعارات والتخزين والمعالجة. لا نضمن استمرارية مزود خارجي بعينه، لكننا نسعى إلى تشغيل بدائل مناسبة عند الحاجة.",
        en: "The website may rely on external integrations for notifications, storage, and processing. We do not guarantee continuity of any specific provider, but we aim to use suitable alternatives when needed.",
      },
      {
        ar: "قد تتغير نقاط التكامل أو مزودات التقنية أو التدفقات التشغيلية وفق متطلبات الأمان أو الامتثال أو التطوير المستقبلي.",
        en: "Integration endpoints, providers, or operational workflows may change based on security, compliance, or future development needs.",
      },
    ],
  },
  {
    title: { ar: "التواصل والمسؤولية", en: "Communication And Responsibility" },
    body: [
      {
        ar: "يسمح باستخدام البريد الرسمي والقنوات الرسمية للمشروع فقط لأغراض الخدمة والمتابعة المشروعة. أي استخدام مسيء أو محاولة استغلال المنظومة قد يؤدي إلى حظر القناة أو الرفض أو الإبلاغ.",
        en: "The official mailbox and official channels may only be used for legitimate service and follow-up purposes. Misuse or abuse may result in blocking, rejection, or reporting.",
      },
      {
        ar: "تطبق هذه الشروط بالتوازي مع سياسات الخصوصية والكوكيز وحذف البيانات، ويكون آخر تحديث مرجعي لهذه النسخة في 3 أبريل 2026.",
        en: "These terms apply alongside the privacy, cookies, and data deletion policies, and the current reference update date for this version is 3 April 2026.",
      },
    ],
  },
];

const cookieSectionsLocalized: LocalizedLegalSection[] = [
  {
    title: { ar: "ما هي ملفات الارتباط", en: "What Cookies Are" },
    body: [
      {
        ar: "ملفات الارتباط وتقنيات التخزين المحلي تساعد الموقع على حفظ تفضيلات الجلسة، تحسين الأداء، دعم اللغة أو السمة، وتثبيت بعض وظائف المحادثة أو النماذج أو القياس.",
        en: "Cookies and local storage technologies help the website preserve session preferences, improve performance, support language or theme preferences, and enable selected chat, form, or measurement functions.",
      },
    ],
  },
  {
    title: { ar: "كيف نستخدمها", en: "How We Use Them" },
    body: [
      {
        ar: "قد يستخدم الموقع ملفات ضرورية للتشغيل وأخرى تحليلية أو وظيفية عند الحاجة، مثل حفظ حالة الواجهة أو تاريخ المحادثة المحلي أو إعدادات العرض للمستخدم.",
        en: "The website may use essential cookies as well as functional or analytical storage when needed, such as interface state, local chat history, or display preferences.",
      },
    ],
    bullets: [
      { ar: "ملفات تشغيل أساسية", en: "Essential operating cookies" },
      { ar: "تفضيلات الواجهة واللغة", en: "Interface and language preferences" },
      { ar: "تخزين محلي لسجل المحادثة على جهاز المستخدم", en: "Local storage for chat history on the user's device" },
      { ar: "قياس وتحسين الأداء عندما تكون الأدوات مفعلة", en: "Performance measurement and optimization when tools are enabled" },
    ],
  },
  {
    title: { ar: "التحكم من جانب المستخدم", en: "User Control" },
    body: [
      {
        ar: "يمكن للمستخدم حذف ملفات الارتباط أو مسح التخزين المحلي من إعدادات المتصفح. وقد يؤدي ذلك إلى فقد بعض التفضيلات أو سجل المحادثة المحلي أو إعادة تهيئة بعض التجارب.",
        en: "Users can delete cookies or clear local storage through browser settings. This may remove certain preferences, local chat history, or reset parts of the browsing experience.",
      },
    ],
  },
  {
    title: { ar: "أطراف خارجية", en: "Third-Party Services" },
    body: [
      {
        ar: "عند تفعيل قنوات أو تكاملات خارجية، قد تعتمد بعض المزايا على تخزين تقني أو طلبات شبكية تخص المزودات المرتبطة، وذلك فقط في حدود ما يلزم لتقديم الخدمة أو القياس أو التحقق.",
        en: "When external channels or integrations are enabled, some features may rely on technical storage or network requests associated with linked providers, only to the extent required for service delivery, measurement, or verification.",
      },
    ],
  },
];

const dataDeletionSectionsLocalized: LocalizedLegalSection[] = [
  {
    title: { ar: "قنوات طلب حذف البيانات", en: "Data Deletion Request Channels" },
    body: [
      {
        ar: "يمكن للمستخدم طلب حذف بياناته أو تقليلها عبر هذه الصفحة أو من خلال البريد الرسمي للمشروع. كما تدعم المنظومة قناة حذف بيانات مخصصة لتكاملات ميتا عند الحاجة.",
        en: "Users may request deletion or reduction of their data through this page or through the official project mailbox. The system also supports a dedicated data deletion path for Meta integrations when needed.",
      },
      {
        ar: "الطلبات المتعلقة ببيانات الصيانة أو الشات أو المرفقات أو الإشعارات تتم مراجعتها قبل التنفيذ للتأكد من هوية صاحب الطلب وحدود الحذف الممكنة نظامياً وتشغيلياً.",
        en: "Requests related to maintenance data, chat content, attachments, or notifications are reviewed before execution to verify identity and determine what can be deleted operationally and legally.",
      },
    ],
    bullets: [
      { ar: "البريد الرسمي: lf@alazab.com", en: "Official email: lf@alazab.com" },
      { ar: "صفحة حذف البيانات العامة", en: "Public data deletion page" },
      { ar: "قناة ميتا الخاصة بحذف البيانات", en: "Meta data deletion callback channel" },
      { ar: "طلبات الدعم اليدوي لحالات التحقق الخاصة", en: "Manual support requests for special verification cases" },
    ],
  },
  {
    title: { ar: "الخطوات المتوقعة", en: "Expected Process" },
    body: [
      {
        ar: "يرسل المستخدم طلبه مع وسيلة تواصل واضحة وبيانات تعريف كافية. يتم التحقق من الطلب ثم تنفيذ الحذف أو التقليل أو الرد بسبب عدم إمكان تنفيذ بعض الأجزاء إذا كان الاحتفاظ لازماً لتوثيق نظامي أو التزام تشغيلي.",
        en: "The user submits a request with clear contact details and sufficient identifying information. The request is verified, then deletion or reduction is performed, or a response is issued when certain data must be retained for legal or operational reasons.",
      },
    ],
    bullets: [
      { ar: "استلام الطلب وتسجيله", en: "Receive and log the request" },
      { ar: "التحقق من هوية مقدم الطلب", en: "Verify the requester's identity" },
      { ar: "مراجعة النطاق والأنظمة المتأثرة", en: "Review scope and impacted systems" },
      { ar: "تنفيذ الحذف أو الرد التوضيحي", en: "Perform deletion or send a clarifying response" },
      { ar: "إرسال رقم تأكيد أو إشعار إتمام عند الإمكان", en: "Send a confirmation code or completion notice when possible" },
    ],
  },
  {
    title: { ar: "روابط الامتثال للتكاملات", en: "Integration Compliance Links" },
    body: [
      {
        ar: "المنصة تولد قناة رد قابلة للاستخدام في ميتا حتى يمكن إتمام متطلبات الامتثال الخاصة بالتطبيقات والصفحات والقنوات المرتبطة بالمشروع.",
        en: "The platform generates a response channel that can be used by Meta so compliance requirements for connected applications, pages, and channels can be completed.",
      },
    ],
  },
];

const socialChannelsLocalized: LocalizedSocialChannelCard[] = [
  {
    title: { ar: "إشعارات واتساب للأعمال", en: "WhatsApp Business Notifications" },
    handle: { ar: "رقم أعمال مخصص لإشعارات النظام", en: "Dedicated business number for system notifications" },
    description: {
      ar: "القناة الرسمية لإشعارات الطلبات والصيانة والتنبيهات التشغيلية وتحديثات الحالة.",
      en: "The official channel for request alerts, maintenance updates, operational notices, and status changes.",
    },
    status: "ready",
    audience: { ar: "العملاء والعمليات الداخلية", en: "Customers and internal operations" },
  },
  {
    title: { ar: "فيسبوك", en: "Facebook" },
    handle: { ar: "صفحة لاكشري فينيشينج", en: "Luxury Finishing page" },
    description: {
      ar: "الصفحة الرسمية للمحتوى المؤسسي والحملات ورسائل التفاعل العامة.",
      en: "The official page for institutional content, campaigns, and public engagement messaging.",
    },
    status: "planned",
    audience: { ar: "الهوية المؤسسية والجمهور العام", en: "Corporate identity and public audience" },
  },
  {
    title: { ar: "إنستجرام", en: "Instagram" },
    handle: { ar: "@luxury.finishing", en: "@luxury.finishing" },
    description: {
      ar: "واجهة بصرية للأعمال والنتائج التنفيذية والهوية الراقية للمشروع.",
      en: "A visual channel for finished work, execution results, and the premium identity of the project.",
    },
    status: "planned",
    audience: { ar: "الصور والمحتوى البصري", en: "Visual content and photography" },
  },
  {
    title: { ar: "لينكدإن", en: "LinkedIn" },
    handle: { ar: "لاكشري فينيشينج من العزب", en: "Luxury Finishing by Alazab" },
    description: {
      ar: "القناة المهنية للشراكات والظهور المؤسسي والمحتوى التجاري.",
      en: "The professional channel for partnerships, institutional presence, and business communication.",
    },
    status: "planned",
    audience: { ar: "الشركات والشركاء", en: "Businesses and partners" },
  },
  {
    title: { ar: "يوتيوب", en: "YouTube" },
    handle: { ar: "قناة لاكشري فينيشينج", en: "Luxury Finishing channel" },
    description: {
      ar: "عرض دراسات الحالة والجولات التنفيذية والمحتوى المرئي الطويل.",
      en: "A channel for case studies, execution walkthroughs, and long-form video content.",
    },
    status: "planned",
    audience: { ar: "المحتوى المرئي المطول", en: "Long-form video content" },
  },
  {
    title: { ar: "تيك توك ورييلز", en: "TikTok And Reels" },
    handle: { ar: "حساب لاكشري فينيشينج", en: "Luxury Finishing account" },
    description: {
      ar: "محتوى قصير يركز على قبل وبعد، التقدم التنفيذي، والهوية البصرية.",
      en: "Short-form content focused on before-and-after visuals, execution progress, and brand identity.",
    },
    status: "planned",
    audience: { ar: "الوصول التفاعلي السريع", en: "Short-form engagement reach" },
  },
];

export const getLegalLinks = (lang: LegalLocale): LegalLinkCard[] =>
  legalLinksLocalized.map((item) => ({
    href: item.href,
    title: pick(item.title, lang),
    description: pick(item.description, lang),
    badge: pick(item.badge, lang),
  }));

export const getComplianceIntegrations = (
  lang: LegalLocale,
): IntegrationComplianceCard[] =>
  complianceIntegrationsLocalized.map((item) => ({
    title: pick(item.title, lang),
    description: pick(item.description, lang),
    status: pick(item.status, lang),
  }));

const mapSections = (sections: LocalizedLegalSection[], lang: LegalLocale): LegalSection[] =>
  sections.map((section) => ({
    title: pick(section.title, lang),
    body: section.body.map((item) => pick(item, lang)),
    bullets: section.bullets?.map((item) => pick(item, lang)),
  }));

export const getPrivacySections = (lang: LegalLocale) =>
  mapSections(privacySectionsLocalized, lang);

export const getTermsSections = (lang: LegalLocale) =>
  mapSections(termsSectionsLocalized, lang);

export const getCookieSections = (lang: LegalLocale) =>
  mapSections(cookieSectionsLocalized, lang);

export const getDataDeletionSections = (lang: LegalLocale) =>
  mapSections(dataDeletionSectionsLocalized, lang);

export const getSocialChannels = (lang: LegalLocale): SocialChannelCard[] =>
  socialChannelsLocalized.map((item) => ({
    title: pick(item.title, lang),
    handle: pick(item.handle, lang),
    description: pick(item.description, lang),
    status: item.status,
    audience: pick(item.audience, lang),
  }));
