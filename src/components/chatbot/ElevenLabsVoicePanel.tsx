import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ConversationProvider,
  useConversation,
  useConversationClientTool,
} from "@elevenlabs/react";
import { Loader2, PhoneCall, PhoneOff, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isMaintenanceRequestNumber,
  isValidEgyptPhone,
  normalizePhoneNumber,
  parsePriority,
  parseServiceType,
  type MaintenancePriority,
  type MaintenanceServiceType,
} from "@/lib/chatbot";

type QueryMode = "request_number" | "client_phone";

type CreateRequestResult = {
  ok: boolean;
  message: string;
};

interface ElevenLabsVoicePanelProps {
  agentId: string;
  disabled?: boolean;
  onAssistantMessage: (content: string) => void;
  onCreateMaintenanceRequest: (
    draft: {
      client_name?: string;
      client_phone?: string;
      service_type?: MaintenanceServiceType;
      description?: string;
      priority?: MaintenancePriority;
    },
    options?: { announce?: boolean },
  ) => Promise<CreateRequestResult>;
  onQueryMaintenanceRequest: (
    mode: QueryMode,
    value: string,
    options?: { announce?: boolean },
  ) => Promise<CreateRequestResult>;
}

type ElevenLabsMaintenanceTools = {
  create_maintenance_request: (params: {
    client_name?: string;
    client_phone?: string;
    service_type?: string;
    description?: string;
    priority?: string;
  }) => Promise<string>;
  query_maintenance_request: (params: {
    request_number?: string;
    client_phone?: string;
  }) => Promise<string>;
};

const VOICE_PROMPT = `أنت مساعد صوتي عربي احترافي لموقع Luxury Finishing.
اختصاصك الأساسي هو:
1. استقبال طلبات الصيانة المعمارية.
2. الاستعلام عن حالة طلبات الصيانة القائمة.
3. الرد بإيجاز ووضوح وبلهجة عربية مهنية.

عند رغبة المستخدم في إنشاء طلب صيانة، اجمع فقط البيانات الناقصة التالية:
- client_name
- client_phone
- service_type
- description
- priority

أنواع الخدمة المقبولة:
- plumbing
- electrical
- ac
- painting
- carpentry
- general

الأولويات المقبولة:
- low
- medium
- high

بعد اكتمال البيانات استخدم الأداة create_maintenance_request ولا تخترع رقم طلب.
عند رغبة المستخدم في الاستعلام، استخدم الأداة query_maintenance_request برقم الطلب أو رقم الهاتف.
إذا كانت البيانات غير صالحة فاطلب تصحيحها بصياغة مختصرة.`;

const statusLabelMap = {
  disconnected: "الصوت المباشر جاهز",
  connecting: "جارٍ الاتصال الصوتي",
  connected: "المحادثة الصوتية نشطة",
  error: "تعذر الاتصال الصوتي",
} as const;

function ElevenLabsVoicePanelInner({
  disabled,
  onAssistantMessage,
  onCreateMaintenanceRequest,
  onQueryMaintenanceRequest,
}: Omit<ElevenLabsVoicePanelProps, "agentId">) {
  const { startSession, endSession, status, message, mode, isListening, isSpeaking } =
    useConversation();
  const hasConnectedRef = useRef(false);
  const previousStatusRef = useRef(status);

  useConversationClientTool<ElevenLabsMaintenanceTools>(
    "create_maintenance_request",
    async (params) => {
      const clientName = params.client_name?.trim();
      const clientPhone = normalizePhoneNumber(params.client_phone ?? "");
      const serviceType = parseServiceType(params.service_type ?? "");
      const description = params.description?.trim();
      const priority = parsePriority(params.priority ?? "");

      if (!clientName) {
        return "اسم العميل مطلوب قبل إنشاء طلب الصيانة.";
      }

      if (!isValidEgyptPhone(clientPhone)) {
        return "رقم هاتف العميل غير صالح. استخدم الصيغة 01xxxxxxxxx.";
      }

      if (!serviceType) {
        return "نوع الخدمة غير صالح. القيم المتاحة: plumbing, electrical, ac, painting, carpentry, general.";
      }

      if (!description || description.length < 5) {
        return "وصف المشكلة مطلوب ويجب أن يكون أوضح من ذلك.";
      }

      if (!priority) {
        return "الأولوية غير صالحة. القيم المقبولة: low, medium, high.";
      }

      const result = await onCreateMaintenanceRequest(
        {
          client_name: clientName,
          client_phone: clientPhone,
          service_type: serviceType,
          description,
          priority,
        },
        { announce: false },
      );

      onAssistantMessage(result.message);
      return result.message;
    },
  );

  useConversationClientTool<ElevenLabsMaintenanceTools>(
    "query_maintenance_request",
    async (params) => {
      const requestNumber = params.request_number?.trim().toUpperCase();
      const clientPhone = normalizePhoneNumber(params.client_phone ?? "");

      if (requestNumber) {
        if (!isMaintenanceRequestNumber(requestNumber)) {
          return "رقم الطلب غير صالح. استخدم الصيغة MR-25-00042.";
        }

        const result = await onQueryMaintenanceRequest("request_number", requestNumber, {
          announce: false,
        });
        onAssistantMessage(result.message);
        return result.message;
      }

      if (!isValidEgyptPhone(clientPhone)) {
        return "رقم الهاتف غير صالح. استخدم الصيغة 01xxxxxxxxx أو أرسل رقم طلب صحيح.";
      }

      const result = await onQueryMaintenanceRequest("client_phone", clientPhone, {
        announce: false,
      });
      onAssistantMessage(result.message);
      return result.message;
    },
  );

  useEffect(() => {
    if (status === "connected") {
      hasConnectedRef.current = true;
    }

    if (previousStatusRef.current === status) {
      return;
    }

    if (status === "connected") {
      onAssistantMessage(
        "تم بدء المحادثة الصوتية المباشرة. يمكنك الآن التحدث لإنشاء طلب صيانة أو الاستعلام عن طلب قائم.",
      );
    }

    if (status === "disconnected" && hasConnectedRef.current) {
      onAssistantMessage("تم إنهاء المحادثة الصوتية المباشرة.");
    }

    if (status === "error") {
      onAssistantMessage(
        message ? `تعذر الاتصال الصوتي عبر ElevenLabs: ${message}` : "تعذر الاتصال الصوتي عبر ElevenLabs.",
      );
    }

    previousStatusRef.current = status;
  }, [message, onAssistantMessage, status]);

  const detailLabel = useMemo(() => {
    if (status !== "connected") {
      return statusLabelMap[status];
    }

    if (isSpeaking || mode === "speaking") {
      return "الوكيل يتحدث الآن";
    }

    if (isListening || mode === "listening") {
      return "الوكيل يستمع الآن";
    }

    return statusLabelMap.connected;
  }, [isListening, isSpeaking, mode, status]);

  const handleToggleSession = useCallback(() => {
    if (status === "connected" || status === "connecting") {
      endSession();
      return;
    }

    startSession();
  }, [endSession, startSession, status]);

  return (
    <div className="mb-3 rounded-2xl border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Waves className="h-4 w-4" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-foreground">المحادثة الصوتية المباشرة</p>
            <p className="text-[11px] text-muted-foreground">{detailLabel}</p>
          </div>
        </div>
        <button
          onClick={handleToggleSession}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            status === "connected" || status === "connecting"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            disabled && "cursor-not-allowed opacity-60",
          )}
          type="button"
        >
          {status === "connecting" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status === "connected" ? (
            <PhoneOff className="h-3.5 w-3.5" />
          ) : (
            <PhoneCall className="h-3.5 w-3.5" />
          )}
          <span>
            {status === "connected" || status === "connecting" ? "إنهاء" : "اتصال صوتي"}
          </span>
        </button>
      </div>
      <p className="mt-2 text-right text-[11px] leading-5 text-muted-foreground">
        متصل مع ElevenLabs Agent ويدعم إنشاء الطلبات والاستعلام عنها عبر الأدوات المحلية.
      </p>
    </div>
  );
}

export default function ElevenLabsVoicePanel({
  agentId,
  disabled,
  onAssistantMessage,
  onCreateMaintenanceRequest,
  onQueryMaintenanceRequest,
}: ElevenLabsVoicePanelProps) {
  return (
    <ConversationProvider
      agentId={agentId}
      overrides={{
        agent: {
          firstMessage:
            "أهلاً بك في Luxury Finishing. كيف أساعدك في طلب صيانة أو الاستعلام عن طلب قائم؟",
          prompt: {
            prompt: VOICE_PROMPT,
          },
        },
      }}
    >
      <ElevenLabsVoicePanelInner
        disabled={disabled}
        onAssistantMessage={onAssistantMessage}
        onCreateMaintenanceRequest={onCreateMaintenanceRequest}
        onQueryMaintenanceRequest={onQueryMaintenanceRequest}
      />
    </ConversationProvider>
  );
}
