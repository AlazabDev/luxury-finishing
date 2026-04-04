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
