export const maintenanceServiceTypes = [
  "plumbing",
  "electrical",
  "ac",
  "painting",
  "carpentry",
  "general",
] as const;

export const maintenancePriorities = ["low", "medium", "high"] as const;

export type MaintenanceServiceType = (typeof maintenanceServiceTypes)[number];
export type MaintenancePriority = (typeof maintenancePriorities)[number];

export interface MaintenanceCreatePayload {
  client_name: string;
  client_phone: string;
  service_type: MaintenanceServiceType;
  description: string;
  priority?: MaintenancePriority;
  channel?: string;
}

export interface MaintenanceQueryPayload {
  request_number?: string;
  client_phone?: string;
}

interface MaintenanceApiConfig {
  apiKey: string;
  baseUrl: string;
}

const requestNumberPattern = /^MR-\d{2}-\d{5}$/i;

export const serviceTypeLabels: Record<MaintenanceServiceType, string> = {
  plumbing: "السباكة",
  electrical: "الكهرباء",
  ac: "التكييف",
  painting: "الدهانات",
  carpentry: "النجارة",
  general: "صيانة عامة",
};

export const priorityLabels: Record<MaintenancePriority, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عاجلة",
};

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

export const isValidRequestNumber = (value: string) => requestNumberPattern.test(value);

export const getMaintenanceConfig = (): MaintenanceApiConfig => {
  const apiKey = Deno.env.get("MAINTENANCE_API_KEY")?.trim();
  const baseUrl = Deno.env.get("MAINTENANCE_API_URL")?.trim();

  if (!apiKey || !baseUrl) {
    throw new Error("Maintenance API credentials not configured");
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/+$/, "") };
};

export const validateCreatePayload = (payload: MaintenanceCreatePayload) => {
  const missingFields: string[] = [];

  if (!payload.client_name?.trim()) missingFields.push("client_name");
  if (!payload.client_phone?.trim()) missingFields.push("client_phone");
  if (!payload.service_type?.trim()) missingFields.push("service_type");
  if (!payload.description?.trim()) missingFields.push("description");

  if (missingFields.length) {
    return { ok: false as const, missingFields };
  }

  const normalizedPhone = normalizePhoneNumber(payload.client_phone);
  if (!isValidEgyptPhone(normalizedPhone)) {
    return { ok: false as const, error: "رقم الهاتف يجب أن يكون مصرياً بصيغة 01xxxxxxxxx" };
  }

  if (!maintenanceServiceTypes.includes(payload.service_type)) {
    return { ok: false as const, error: "نوع الخدمة غير صالح" };
  }

  if (
    payload.priority &&
    !maintenancePriorities.includes(payload.priority)
  ) {
    return { ok: false as const, error: "الأولوية غير صالحة" };
  }

  return {
    ok: true as const,
    payload: {
      ...payload,
      client_name: payload.client_name.trim(),
      client_phone: normalizedPhone,
      description: payload.description.trim(),
      priority: payload.priority ?? "medium",
      channel: payload.channel ?? "website-chatbot",
    },
  };
};

export const validateQueryPayload = (payload: MaintenanceQueryPayload) => {
  if (!payload.request_number && !payload.client_phone) {
    return { ok: false as const, error: "Provide request_number or client_phone" };
  }

  if (payload.request_number) {
    const normalized = payload.request_number.trim().toUpperCase();
    if (!isValidRequestNumber(normalized)) {
      return { ok: false as const, error: "رقم الطلب يجب أن يكون بصيغة MR-25-00042" };
    }

    return { ok: true as const, query: { request_number: normalized } };
  }

  const normalizedPhone = normalizePhoneNumber(payload.client_phone ?? "");
  if (!isValidEgyptPhone(normalizedPhone)) {
    return { ok: false as const, error: "رقم الهاتف يجب أن يكون مصرياً بصيغة 01xxxxxxxxx" };
  }

  return { ok: true as const, query: { client_phone: normalizedPhone } };
};

const readJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const createMaintenanceRequest = async (
  payload: MaintenanceCreatePayload,
) => {
  const config = getMaintenanceConfig();
  const validation = validateCreatePayload(payload);

  if (!validation.ok) {
    return validation;
  }

  const response = await fetch(`${config.baseUrl}/maintenance-gateway`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.payload),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    return {
      ok: false as const,
      error:
        (data && typeof data === "object" && "error" in data && String(data.error)) ||
        `Maintenance API error [${response.status}]`,
      details: data,
    };
  }

  return { ok: true as const, data };
};

export const queryMaintenanceRequests = async (
  payload: MaintenanceQueryPayload,
) => {
  const config = getMaintenanceConfig();
  const validation = validateQueryPayload(payload);

  if (!validation.ok) {
    return validation;
  }

  const search = new URLSearchParams(validation.query).toString();
  const response = await fetch(`${config.baseUrl}/query-maintenance-requests?${search}`, {
    headers: { "x-api-key": config.apiKey },
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    return {
      ok: false as const,
      error:
        (data && typeof data === "object" && "error" in data && String(data.error)) ||
        `Maintenance API error [${response.status}]`,
      details: data,
    };
  }

  return { ok: true as const, data };
};

export const summarizeCreatedRequest = (data: unknown) => {
  const payload = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const requestNumber =
    String(payload.request_number ?? payload.requestNo ?? payload.id ?? "").trim();
  const status = String(payload.status ?? "pending").trim();

  if (!requestNumber) {
    return "تم إرسال طلب الصيانة بنجاح، وسيتم التواصل مع العميل قريباً.";
  }

  return `تم إنشاء طلب الصيانة بنجاح. رقم الطلب: ${requestNumber}، والحالة الحالية: ${status}.`;
};

export const summarizeQueryResult = (data: unknown) => {
  const payload = Array.isArray(data)
    ? data[0]
    : data && typeof data === "object" && "data" in (data as Record<string, unknown>)
      ? (data as Record<string, unknown>).data
      : data;

  if (Array.isArray(payload) && payload.length === 0) {
    return "لم يتم العثور على طلبات مطابقة للبيانات المدخلة.";
  }

  const item = Array.isArray(payload) ? payload[0] : payload;
  if (!item || typeof item !== "object") {
    return "تم تنفيذ الاستعلام، لكن تعذر تفسير بيانات الطلب.";
  }

  const record = item as Record<string, unknown>;
  const requestNumber = String(record.request_number ?? record.requestNo ?? "-");
  const status = String(record.status ?? record.current_status ?? "غير متاحة");
  const serviceType = String(record.service_type ?? record.service ?? "غير محدد");
  const priority = String(record.priority ?? "medium");

  const serviceLabel =
    serviceType in serviceTypeLabels
      ? serviceTypeLabels[serviceType as MaintenanceServiceType]
      : serviceType;
  const priorityLabel =
    priority in priorityLabels
      ? priorityLabels[priority as MaintenancePriority]
      : priority;

  return `بيانات الطلب ${requestNumber}: الحالة ${status}، نوع الخدمة ${serviceLabel}، والأولوية ${priorityLabel}.`;
};
