export const maintenanceServiceOptions = [
  { value: "plumbing", label: "السباكة" },
  { value: "electrical", label: "الكهرباء" },
  { value: "ac", label: "التكييف" },
  { value: "painting", label: "الدهانات" },
  { value: "carpentry", label: "النجارة" },
  { value: "general", label: "صيانة عامة" },
] as const;

export const maintenancePriorityOptions = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عاجلة" },
] as const;

export type MaintenanceServiceType = (typeof maintenanceServiceOptions)[number]["value"];
export type MaintenancePriority = (typeof maintenancePriorityOptions)[number]["value"];

export const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.startsWith("20") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("0020") && digits.length === 14) {
    return `0${digits.slice(4)}`;
  }

  return digits;
};

export const isValidEgyptPhone = (value: string) => /^01\d{9}$/.test(value);

export const isMaintenanceRequestNumber = (value: string) =>
  /^MR-\d{2}-\d{5}$/i.test(value.trim());

export const detectChatIntent = (text: string) => {
  const normalized = text.trim().toLowerCase();

  if (
    isMaintenanceRequestNumber(normalized.toUpperCase()) ||
    /استعلام|متابعة|حالة الطلب|رقم الطلب|طلبي|طلبي/.test(text)
  ) {
    return "query_maintenance" as const;
  }

  if (
    /صيانة|عطل|بلاغ|طلب صيانة|سباكة|كهرباء|تكييف|نجارة|دهان|دهانات/.test(text)
  ) {
    return "create_maintenance" as const;
  }

  return "general" as const;
};

export const getServiceLabel = (value: MaintenanceServiceType) =>
  maintenanceServiceOptions.find((option) => option.value === value)?.label ?? value;

export const getPriorityLabel = (value: MaintenancePriority) =>
  maintenancePriorityOptions.find((option) => option.value === value)?.label ?? value;

export const parseServiceType = (text: string): MaintenanceServiceType | null => {
  const normalized = text.trim().toLowerCase();

  const direct = maintenanceServiceOptions.find((option) => option.value === normalized);
  if (direct) return direct.value;

  if (/سباكة|مياه|صرف/.test(text)) return "plumbing";
  if (/كهرباء|إضاءة|قاطع|ماس/.test(text)) return "electrical";
  if (/تكييف|تبريد|تسريب فريون|ac/.test(normalized)) return "ac";
  if (/دهان|دهانات|نقاشة/.test(text)) return "painting";
  if (/نجارة|باب|خشب|مطبخ/.test(text)) return "carpentry";
  if (/تشطيب|عام|صيانة عامة/.test(text)) return "general";

  return null;
};

export const parsePriority = (text: string): MaintenancePriority | null => {
  const normalized = text.trim().toLowerCase();

  const direct = maintenancePriorityOptions.find((option) => option.value === normalized);
  if (direct) return direct.value;

  if (/عاجل|طارئ|فوري|high/.test(normalized)) return "high";
  if (/منخفض|عادي|بسيط|low/.test(normalized)) return "low";
  if (/متوسط|متوسطة|medium/.test(normalized)) return "medium";

  return null;
};

export interface QuotePrefill {
  name?: string;
  phone?: string;
  email?: string;
  area?: string;
  propertyType?: string;
  location?: string;
  notes?: string;
}

const PROPERTY_KEYWORDS: Array<[RegExp, string]> = [
  [/فيلا|villa/i, "فيلا"],
  [/دوبلكس|duplex/i, "دوبلكس"],
  [/بنتهاوس|penthouse/i, "بنتهاوس"],
  [/تاون\s*هاوس|townhouse/i, "تاون هاوس"],
  [/استوديو|studio/i, "استوديو"],
  [/شقة|شقه|apartment|flat/i, "شقة"],
];

/** Best-effort extraction of quote fields from the user's chat messages. */
export const extractQuotePrefill = (userMessages: string[]): QuotePrefill => {
  const text = userMessages.join("\n");
  const prefill: QuotePrefill = {};

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)?.[0];
  if (email) prefill.email = email.slice(0, 255);

  const phoneMatch = text.match(/(?:\+?2)?0?1[0-9]{9}/);
  if (phoneMatch) {
    const normalized = normalizePhoneNumber(phoneMatch[0]);
    if (isValidEgyptPhone(normalized)) prefill.phone = normalized;
  }

  const name = text.match(/(?:اسمي|انا اسمي|أنا اسمي|my name is|i'?m)\s+([\p{L}\s]{3,40})/iu)?.[1];
  if (name) prefill.name = name.trim().replace(/\s+/g, " ").slice(0, 100);

  const area = text.match(/(\d{2,4})\s*(?:متر|م2|م٢|sqm|square meters?)/i)?.[1];
  if (area) prefill.area = area;

  for (const [pattern, label] of PROPERTY_KEYWORDS) {
    if (pattern.test(text)) {
      prefill.propertyType = label;
      break;
    }
  }

  const location = text.match(/(?:في|بمنطقة|منطقة|بمدينة|in)\s+((?:القاهرة|الجيزة|الاسكندرية|الإسكندرية|التجمع|الشيخ زايد|أكتوبر|اكتوبر|المعادي|مدينة نصر|العاصمة الإدارية|الرحاب|مدينتي)[\p{L}\s]{0,20})/u)?.[1];
  if (location) prefill.location = location.trim().slice(0, 200);

  const lastUser = userMessages[userMessages.length - 1];
  if (lastUser) prefill.notes = lastUser.trim().slice(0, 500);

  return prefill;
};

export const buildQuoteQuery = (prefill: QuotePrefill) => {
  const params = new URLSearchParams();
  Object.entries(prefill).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};
