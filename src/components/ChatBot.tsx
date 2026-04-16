import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  History,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import ElevenLabsVoicePanel from "@/components/chatbot/ElevenLabsVoicePanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  detectChatIntent,
  getPriorityLabel,
  getServiceLabel,
  isMaintenanceRequestNumber,
  isValidEgyptPhone,
  maintenancePriorityOptions,
  maintenanceServiceOptions,
  normalizePhoneNumber,
  parsePriority,
  parseServiceType,
  type MaintenancePriority,
  type MaintenanceServiceType,
} from "@/lib/chatbot";
import {
  buildAttachmentContext,
  buildModelMessageContent,
  buildTranscriptFileName,
  createChatEntityId,
  createChatMessage,
  createConversationSession,
  clearConversationHistory,
  formatAttachmentSize,
  hasMeaningfulConversation,
  loadConversationHistory,
  removeConversationHistoryEntry,
  serializeConversationTranscript,
  type ChatAttachmentSummary,
  type ChatConversationSession,
  type ChatMessage,
  upsertConversationHistory,
} from "@/lib/chatbot-ui";
import { useLanguage } from "@/contexts/LanguageContext";

type ActionButton = { id: string; label: string; value: string };
type QueryMode = "request_number" | "client_phone";
type CreateFlowStep =
  | "client_name"
  | "client_phone"
  | "service_type"
  | "description"
  | "priority"
  | "confirm";
type QueryFlowStep = "mode" | "identifier";
type ChatTab = "text" | "voice";

interface MaintenanceCreateDraft {
  client_name?: string;
  client_phone?: string;
  service_type?: MaintenanceServiceType;
  description?: string;
  priority?: MaintenancePriority;
}

interface PendingAttachment {
  id: string;
  file: File;
  summary: ChatAttachmentSummary;
}

type MaintenanceFlow =
  | {
      kind: "create";
      step: CreateFlowStep;
      draft: MaintenanceCreateDraft;
    }
  | {
      kind: "query";
      step: QueryFlowStep;
      mode?: QueryMode;
    };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt`;
const MAINTENANCE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-proxy`;
const ATTACHMENTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-attachments`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

const MAX_PENDING_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENTS =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar,.dwg";

type MaintenanceActionResult = {
  ok: boolean;
  message: string;
};

const getWelcomeMessage = (lang: "ar" | "en") =>
  lang === "ar"
    ? "مرحباً! أنا عزبوت 👋\nكيف يمكنني مساعدتك؟"
    : "Hello! I'm AzaBot 👋\nHow can I help you?";

const getQuickSuggestions = (lang: "ar" | "en") =>
  lang === "ar"
    ? [
        { id: "services", label: "ما هي خدمات الشركة؟", value: "ما هي خدمات الشركة؟" },
        { id: "quote", label: "أريد عرض سعر تشطيب", value: "أريد عرض سعر تشطيب" },
        { id: "prices", label: "ما هي أسعار التشطيب؟", value: "ما هي أسعار التشطيب؟" },
        { id: "branches", label: "ما هي فروع الشركة؟", value: "ما هي فروع الشركة؟" },
      ]
    : [
        { id: "services", label: "What are your services?", value: "What are your services?" },
        { id: "quote", label: "I want a finishing quote", value: "I want a finishing quote" },
        { id: "prices", label: "What are finishing prices?", value: "What are finishing prices?" },
        { id: "branches", label: "Where are your branches?", value: "Where are your branches?" },
      ];

const createWelcomeMessage = (lang: "ar" | "en") =>
  createChatMessage("assistant", getWelcomeMessage(lang));

const createPendingAttachment = (file: File): PendingAttachment => {
  const id = createChatEntityId("attachment");
  return {
    id,
    file,
    summary: { id, name: file.name, size: file.size, type: file.type },
  };
};

const createDownloadLink = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export default function ChatBot() {
  const { lang, t } = useLanguage();
  const welcomeMessage = getWelcomeMessage(lang);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>("text");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(lang)]);
  const [conversationId, setConversationId] = useState(() =>
    createChatEntityId("conversation"),
  );
  const [conversationHistory, setConversationHistory] = useState<ChatConversationSession[]>(
    () => loadConversationHistory(),
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingTts, setPlayingTts] = useState(false);
  const [maintenanceFlow, setMaintenanceFlow] = useState<MaintenanceFlow | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const showQuickSuggestions = messages.length <= 1;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pendingAttachments.length]);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0]?.role === "assistant"
        ? [createWelcomeMessage(lang)]
        : prev,
    );
  }, [lang]);

  useEffect(() => {
    if (!hasMeaningfulConversation(messages)) return;
    setConversationHistory((prev) => {
      const existing = prev.find((item) => item.id === conversationId);
      return upsertConversationHistory(
        prev,
        createConversationSession(conversationId, messages, existing),
      );
    });
  }, [conversationId, messages]);

  const resetComposer = useCallback(() => {
    setInput("");
    setPendingAttachments([]);
  }, []);

  const appendAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, createChatMessage("assistant", content)]);
  }, []);

  const startNewConversation = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setLoading(false);
    setPlayingTts(false);
    setMaintenanceFlow(null);
    setConversationId(createChatEntityId("conversation"));
    setMessages([createWelcomeMessage(lang)]);
    resetComposer();
  }, [resetComposer, lang]);

  const restoreConversation = useCallback((session: ChatConversationSession) => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setLoading(false);
    setPlayingTts(false);
    setMaintenanceFlow(null);
    setConversationId(session.id);
    setMessages(session.messages);
    resetComposer();
    setHistoryOpen(false);
  }, [resetComposer]);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversationHistory((prev) => removeConversationHistoryEntry(prev, id));
    if (conversationId === id) startNewConversation();
  }, [conversationId, startNewConversation]);

  const handleClearHistory = useCallback(() => {
    setConversationHistory(clearConversationHistory());
    startNewConversation();
    toast.success(t("chat.clearSuccess"));
  }, [startNewConversation, t]);

  const handleDownloadTranscript = useCallback(() => {
    if (!hasMeaningfulConversation(messages)) {
      toast.error(t("chat.downloadEmpty"));
      return;
    }
    const existing = conversationHistory.find((item) => item.id === conversationId);
    const session = createConversationSession(conversationId, messages, existing);
    createDownloadLink(
      serializeConversationTranscript(session),
      buildTranscriptFileName(session),
    );
    toast.success(t("chat.downloadSuccess"));
  }, [conversationHistory, conversationId, messages, t]);

  const handleAttachmentSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      if (!selectedFiles.length) return;
      setPendingAttachments((prev) => {
        const availableSlots = Math.max(0, MAX_PENDING_ATTACHMENTS - prev.length);
        const validFiles = selectedFiles
          .filter((file) => {
            if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
              toast.error(`الملف ${file.name} يتجاوز الحد المسموح 10MB.`);
              return false;
            }
            return true;
          })
          .slice(0, availableSlots);
        if (selectedFiles.length > availableSlots) {
          toast.error(`يمكن إرفاق ${MAX_PENDING_ATTACHMENTS} ملفات كحد أقصى.`);
        }
        return [...prev, ...validFiles.map(createPendingAttachment)];
      });
      event.target.value = "";
    },
    [],
  );

  const removePendingAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const uploadPendingAttachments = useCallback(
    async (attachments: PendingAttachment[]): Promise<ChatAttachmentSummary[]> => {
      const uploaded: ChatAttachmentSummary[] = [];
      for (const attachment of attachments) {
        const formData = new FormData();
        formData.append("file", attachment.file, attachment.file.name);
        formData.append("category", "chatbot");
        formData.append("conversationId", conversationId);
        const response = await fetch(ATTACHMENTS_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${ANON_KEY}` },
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || `تعذر رفع الملف ${attachment.summary.name}.`);
        }
        uploaded.push({
          ...attachment.summary,
          url: payload.data?.url,
          storageProvider: "seafile",
          storagePath: payload.data?.path,
        });
      }
      return uploaded;
    },
    [conversationId],
  );

  const streamChat = useCallback(async (allMessages: ChatMessage[]) => {
    setLoading(true);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== welcomeMessage) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, createChatMessage("assistant", assistantSoFar)];
      });
    };
    try {
      const payloadMessages = allMessages.map((m) => ({
        role: m.role,
        content: buildModelMessageContent(m),
      }));
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });
      if (!resp.ok || !resp.body) throw new Error("Stream failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buffer = `${line}\n${buffer}`;
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      upsert(lang === "ar" ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." : "Sorry, an error occurred. Please try again.");
    }
    setLoading(false);
  }, [welcomeMessage, lang]);

  const sendMaintenanceRequest = useCallback(
    async (draft: MaintenanceCreateDraft, options?: { announce?: boolean }): Promise<MaintenanceActionResult> => {
      setLoading(true);
      try {
        const response = await fetch(MAINTENANCE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
          body: JSON.stringify({ action: "create", channel: "website-chatbot", ...draft }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "تعذر إنشاء طلب الصيانة.");
        const requestNumber = payload.data?.request_number || payload.data?.data?.request_number;
        const message = requestNumber
          ? `تم إنشاء طلب الصيانة بنجاح.\nرقم الطلب: **${requestNumber}**\nسيتم التواصل معك قريباً.`
          : "تم إنشاء طلب الصيانة بنجاح وسيتم التواصل معك قريباً.";
        if (options?.announce !== false) appendAssistantMessage(message);
        setMaintenanceFlow(null);
        return { ok: true, message };
      } catch (error) {
        const message = `تعذر إنشاء الطلب حالياً. ${error instanceof Error ? error.message : "يرجى المحاولة مرة أخرى."}`;
        if (options?.announce !== false) appendAssistantMessage(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [appendAssistantMessage],
  );

  const queryMaintenanceRequest = useCallback(
    async (mode: QueryMode, value: string, options?: { announce?: boolean }): Promise<MaintenanceActionResult> => {
      setLoading(true);
      try {
        const body = mode === "request_number"
          ? { action: "query", request_number: value.trim().toUpperCase() }
          : { action: "query", client_phone: normalizePhoneNumber(value) };
        const response = await fetch(MAINTENANCE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
          body: JSON.stringify(body),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "تعذر الاستعلام عن الطلب.");
        const result = Array.isArray(payload.data?.data) ? payload.data.data[0] : Array.isArray(payload.data) ? payload.data[0] : payload.data;
        const message = !result
          ? "لم يتم العثور على طلبات مطابقة."
          : `تم العثور على الطلب.\nرقم الطلب: **${result.request_number ?? "-"}**\nالحالة: **${result.status ?? "غير متاحة"}**`;
        if (options?.announce !== false) appendAssistantMessage(message);
        setMaintenanceFlow(null);
        return { ok: true, message };
      } catch (error) {
        const message = `تعذر تنفيذ الاستعلام. ${error instanceof Error ? error.message : "يرجى المحاولة مرة أخرى."}`;
        if (options?.announce !== false) appendAssistantMessage(message);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [appendAssistantMessage],
  );

  const startCreateFlow = useCallback(() => {
    setMaintenanceFlow({ kind: "create", step: "client_name", draft: {} });
    appendAssistantMessage("لبدء طلب الصيانة، ما اسم العميل بالكامل؟");
  }, [appendAssistantMessage]);

  const startQueryFlow = useCallback(() => {
    setMaintenanceFlow({ kind: "query", step: "mode" });
    appendAssistantMessage("هل تريد الاستعلام برقم الطلب أم برقم هاتف العميل؟");
  }, [appendAssistantMessage]);

  const cancelMaintenanceFlow = useCallback(() => {
    setMaintenanceFlow(null);
    appendAssistantMessage("تم إلغاء إجراء الصيانة. يمكنك بدء طلب جديد في أي وقت.");
  }, [appendAssistantMessage]);

  const handleCreateFlowInput = useCallback(
    async (text: string, flow: Extract<MaintenanceFlow, { kind: "create" }>) => {
      if (flow.step === "client_name") {
        setMaintenanceFlow({ kind: "create", step: "client_phone", draft: { ...flow.draft, client_name: text.trim() } });
        appendAssistantMessage("أدخل رقم هاتف العميل بصيغة 01xxxxxxxxx.");
        return;
      }
      if (flow.step === "client_phone") {
        const phone = normalizePhoneNumber(text);
        if (!isValidEgyptPhone(phone)) { appendAssistantMessage("رقم الهاتف غير صالح. أدخله بصيغة 01xxxxxxxxx."); return; }
        setMaintenanceFlow({ kind: "create", step: "service_type", draft: { ...flow.draft, client_phone: phone } });
        appendAssistantMessage("اختر نوع خدمة الصيانة المطلوبة.");
        return;
      }
      if (flow.step === "service_type") {
        const serviceType = parseServiceType(text);
        if (!serviceType) { appendAssistantMessage("نوع الخدمة غير واضح. اختر: سباكة، كهرباء، تكييف، دهانات، نجارة، صيانة عامة."); return; }
        setMaintenanceFlow({ kind: "create", step: "description", draft: { ...flow.draft, service_type: serviceType } });
        appendAssistantMessage("اكتب وصف المشكلة أو الأعمال المطلوبة بالتفصيل.");
        return;
      }
      if (flow.step === "description") {
        if (text.trim().length < 5) { appendAssistantMessage("الوصف قصير جداً. أضف تفاصيل أوضح."); return; }
        setMaintenanceFlow({ kind: "create", step: "priority", draft: { ...flow.draft, description: text.trim() } });
        appendAssistantMessage("حدد أولوية الطلب.");
        return;
      }
      if (flow.step === "priority") {
        const priority = parsePriority(text);
        if (!priority) { appendAssistantMessage("حدد الأولوية: منخفضة، متوسطة، أو عاجلة."); return; }
        const nextDraft = { ...flow.draft, priority };
        setMaintenanceFlow({ kind: "create", step: "confirm", draft: nextDraft });
        appendAssistantMessage(
          `راجع البيانات:\n- العميل: **${nextDraft.client_name}**\n- الهاتف: **${nextDraft.client_phone}**\n- الخدمة: **${getServiceLabel(nextDraft.service_type!)}**\n- الأولوية: **${getPriorityLabel(priority)}**\n- الوصف: ${nextDraft.description}\n\nأرسل "تأكيد" أو "إلغاء".`,
        );
        return;
      }
      if (flow.step === "confirm") {
        if (/^تأكيد|confirm|send$/i.test(text.trim())) { await sendMaintenanceRequest(flow.draft); return; }
        if (/^إلغاء|الغاء|cancel$/i.test(text.trim())) { cancelMaintenanceFlow(); return; }
        appendAssistantMessage('أرسل "تأكيد" أو "إلغاء".');
      }
    },
    [appendAssistantMessage, cancelMaintenanceFlow, sendMaintenanceRequest],
  );

  const handleQueryFlowInput = useCallback(
    async (text: string, flow: Extract<MaintenanceFlow, { kind: "query" }>) => {
      if (flow.step === "mode") {
        if (/رقم الطلب|طلب|mr-/i.test(text)) {
          setMaintenanceFlow({ kind: "query", step: "identifier", mode: "request_number" });
          appendAssistantMessage("أدخل رقم الطلب بصيغة MR-25-00042.");
          return;
        }
        if (/هاتف|موبايل|رقم العميل/i.test(text)) {
          setMaintenanceFlow({ kind: "query", step: "identifier", mode: "client_phone" });
          appendAssistantMessage("أدخل رقم هاتف العميل بصيغة 01xxxxxxxxx.");
          return;
        }
        appendAssistantMessage("اختر: رقم الطلب أو رقم الهاتف.");
        return;
      }
      if (flow.step === "identifier" && flow.mode === "request_number") {
        const rn = text.trim().toUpperCase();
        if (!isMaintenanceRequestNumber(rn)) { appendAssistantMessage("رقم الطلب غير صالح. استخدم MR-25-00042."); return; }
        await queryMaintenanceRequest("request_number", rn);
        return;
      }
      if (flow.step === "identifier" && flow.mode === "client_phone") {
        const phone = normalizePhoneNumber(text);
        if (!isValidEgyptPhone(phone)) { appendAssistantMessage("رقم الهاتف غير صالح."); return; }
        await queryMaintenanceRequest("client_phone", phone);
      }
    },
    [appendAssistantMessage, queryMaintenanceRequest],
  );

  const handleTextSubmission = useCallback(
    async (rawText: string, attachments: ChatAttachmentSummary[] = []) => {
      const trimmed = rawText.trim();
      if ((!trimmed && attachments.length === 0) || loading || uploadingAttachments) return;
      const displayContent = trimmed || (attachments.length ? (lang === "ar" ? "تم إرفاق ملفات." : "Files attached.") : "");
      const userMessage = createChatMessage("user", displayContent, attachments);
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      if (maintenanceFlow && !trimmed && attachments.length > 0) {
        appendAssistantMessage(lang === "ar" ? "تمت إضافة المرفقات. أرسل النص المطلوب للمتابعة." : "Attachments added. Send required text to continue.");
        return;
      }
      const effectiveText = attachments.length ? `${trimmed || ""}${buildAttachmentContext(attachments)}` : trimmed;
      if (maintenanceFlow?.kind === "create") { await handleCreateFlowInput(effectiveText, maintenanceFlow); return; }
      if (maintenanceFlow?.kind === "query") { await handleQueryFlowInput(effectiveText, maintenanceFlow); return; }
      if (trimmed && isMaintenanceRequestNumber(trimmed)) { await queryMaintenanceRequest("request_number", trimmed.toUpperCase()); return; }
      const normalizedPhone = normalizePhoneNumber(trimmed);
      if (trimmed && /^استعلام\s+/.test(trimmed) && isValidEgyptPhone(normalizedPhone)) { await queryMaintenanceRequest("client_phone", normalizedPhone); return; }
      const intent = detectChatIntent(trimmed);
      if (intent === "create_maintenance") { startCreateFlow(); return; }
      if (intent === "query_maintenance") { startQueryFlow(); return; }
      await streamChat(updatedMessages);
    },
    [appendAssistantMessage, handleCreateFlowInput, handleQueryFlowInput, lang, loading, maintenanceFlow, messages, queryMaintenanceRequest, startCreateFlow, startQueryFlow, streamChat, uploadingAttachments],
  );

  const handleSend = useCallback(async () => {
    const text = input;
    if (!text.trim() && pendingAttachments.length === 0) return;
    setUploadingAttachments(true);
    try {
      const attachments = pendingAttachments.length ? await uploadPendingAttachments(pendingAttachments) : [];
      resetComposer();
      await handleTextSubmission(text, attachments);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر رفع المرفقات.");
    } finally {
      setUploadingAttachments(false);
    }
  }, [handleTextSubmission, input, pendingAttachments, resetComposer, uploadPendingAttachments]);

  const handleTts = useCallback(async (text: string) => {
    setPlayingTts(true);
    try {
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlayingTts(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setPlayingTts(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const resp = await fetch(STT_URL, { method: "POST", headers: { Authorization: `Bearer ${ANON_KEY}` }, body: formData });
          if (!resp.ok) throw new Error("STT failed");
          const data = await resp.json();
          if (data.text) await handleTextSubmission(data.text);
        } catch (error) { console.error("STT error:", error); }
        setLoading(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      console.error("Mic error:", error);
      toast.error(lang === "ar" ? "تعذر الوصول إلى الميكروفون." : "Cannot access microphone.");
    }
  }, [handleTextSubmission, lang]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const currentActionButtons: ActionButton[] = React.useMemo(() => {
    if (!maintenanceFlow) return [];

    if (maintenanceFlow.kind === "create" && maintenanceFlow.step === "service_type") {
      const labels: Record<MaintenanceServiceType, string> = lang === "ar"
        ? { plumbing: "السباكة", electrical: "الكهرباء", ac: "التكييف", painting: "الدهانات", carpentry: "النجارة", general: "صيانة عامة" }
        : { plumbing: "Plumbing", electrical: "Electrical", ac: "AC", painting: "Painting", carpentry: "Carpentry", general: "General" };
      return maintenanceServiceOptions.map((o) => ({ id: o.value, label: labels[o.value], value: labels[o.value] }));
    }

    if (maintenanceFlow.kind === "create" && maintenanceFlow.step === "priority") {
      const labels: Record<MaintenancePriority, string> = lang === "ar"
        ? { low: "منخفضة", medium: "متوسطة", high: "عاجلة" }
        : { low: "Low", medium: "Medium", high: "High" };
      return maintenancePriorityOptions.map((o) => ({ id: o.value, label: labels[o.value], value: labels[o.value] }));
    }

    if (maintenanceFlow.kind === "create" && maintenanceFlow.step === "confirm") {
      return [
        { id: "confirm", label: lang === "ar" ? "تأكيد" : "Confirm", value: lang === "ar" ? "تأكيد" : "Confirm" },
        { id: "cancel", label: lang === "ar" ? "إلغاء" : "Cancel", value: lang === "ar" ? "إلغاء" : "Cancel" },
      ];
    }

    if (maintenanceFlow.kind === "query" && maintenanceFlow.step === "mode") {
      return [
        { id: "by-request", label: lang === "ar" ? "برقم الطلب" : "By request number", value: lang === "ar" ? "رقم الطلب" : "Request number" },
        { id: "by-phone", label: lang === "ar" ? "برقم الهاتف" : "By phone number", value: lang === "ar" ? "رقم الهاتف" : "Phone number" },
      ];
    }

    return [{ id: "cancel-flow", label: lang === "ar" ? "إلغاء" : "Cancel", value: lang === "ar" ? "إلغاء" : "Cancel" }];
  }, [lang, maintenanceFlow]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={ACCEPTED_ATTACHMENTS}
        onChange={handleAttachmentSelect}
      />

      {/* Floating chatbot trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          open
            ? "bg-accent text-accent-foreground rotate-0"
            : "bg-accent text-accent-foreground",
        )}
        aria-label={t("chat.open")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </button>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent
          side="right"
          className="w-full border-s border-border bg-background p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>{t("chat.historyTitle")}</SheetTitle>
            <SheetDescription>{t("chat.historyLead")}</SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={startNewConversation} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                {t("chat.newConversation")}
              </button>
              {conversationHistory.length ? (
                <button type="button" onClick={handleClearHistory} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive">
                  {t("chat.clearAll")}
                </button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{conversationHistory.length} {t("chat.historyCount")}</p>
          </div>

          <ScrollArea className="h-[calc(100vh-150px)]">
            <div className="space-y-3 p-4">
              {conversationHistory.length ? (
                conversationHistory.map((session) => (
                  <div key={session.id} className={cn("rounded-2xl border border-border bg-muted/30 p-4 transition-colors", session.id === conversationId && "border-primary/50 bg-primary/5")}>
                    <button type="button" onClick={() => restoreConversation(session)} className="w-full text-start">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{session.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(session.updatedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{session.messages.length} {lang === "ar" ? "رسالة" : "messages"}</p>
                    </button>
                    <div className="mt-3 flex items-center justify-between">
                      <button type="button" onClick={() => handleDeleteConversation(session.id)} className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                        {lang === "ar" ? "حذف" : "Delete"}
                      </button>
                      {session.id === conversationId ? (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{t("chat.current")}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-medium text-foreground">{t("chat.historyEmpty")}</p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{t("chat.historyEmptyLead")}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Chat Window */}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:bottom-24 sm:end-6 sm:h-[580px] sm:w-[370px] sm:rounded-3xl sm:border sm:border-border sm:shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-accent px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setHistoryOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 transition-colors" title={t("chat.history")}>
                  <History className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center flex-1">
                <p className="text-sm font-bold text-accent-foreground">
                  {lang === "ar" ? "عزبوت (AzaBot)" : "AzaBot"}
                </p>
                <p className="text-[11px] text-accent-foreground/70">
                  {lang === "ar" ? "المساعد الذكي - متصل الآن" : "AI Assistant - Online"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={startNewConversation} className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 transition-colors" title={t("chat.newConversation")}>
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleDownloadTranscript} className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 transition-colors" title={t("chat.download")}>
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setActiveTab("text")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors border-b-2",
                activeTab === "text"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              {lang === "ar" ? "محادثة نصية" : "Text Chat"}
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors border-b-2",
                activeTab === "voice"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Mic className="h-3.5 w-3.5" />
              {lang === "ar" ? "محادثة صوتية" : "Voice Chat"}
            </button>
          </div>

          {/* Content */}
          {activeTab === "text" ? (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" dir={lang === "ar" ? "rtl" : "ltr"}>
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user"
                        ? "rounded-se-sm bg-primary text-primary-foreground"
                        : "rounded-ss-sm bg-muted text-foreground",
                    )}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      {message.attachments?.length ? (
                        <div className="mt-3 space-y-2 border-t border-current/10 pt-3">
                          {message.attachments.map((att) => (
                            <div key={att.id} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]", message.role === "user" ? "bg-primary-foreground/10 text-primary-foreground" : "bg-background/70 text-foreground")}>
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <div>
                                <p className="line-clamp-1 max-w-[170px]">{att.name}</p>
                                <p className="text-[10px] opacity-80">{formatAttachmentSize(att.size)}</p>
                                {att.url ? (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[10px] underline underline-offset-2">
                                    <ExternalLink className="h-3 w-3" />
                                    {lang === "ar" ? "فتح" : "Open"}
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {message.role === "assistant" && message.content !== welcomeMessage ? (
                        <button
                          type="button"
                          onClick={() => handleTts(message.content)}
                          disabled={playingTts}
                          className="absolute -bottom-1 -start-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-110"
                          title={t("chat.listen")}
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {/* Quick suggestions */}
                {showQuickSuggestions && (
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {getQuickSuggestions(lang).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => void handleTextSubmission(s.value)}
                        disabled={loading}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent/10 hover:border-accent hover:text-accent"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                {loading || uploadingAttachments ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-ss-sm bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              {currentActionButtons.length > 0 && (
                <div className="border-t border-border px-3 py-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentActionButtons.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => void handleTextSubmission(action.value)}
                        disabled={loading || uploadingAttachments}
                        className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Attachments */}
              {pendingAttachments.length > 0 && (
                <div className="border-t border-border px-3 py-2">
                  <div className="flex flex-wrap gap-2" dir={lang === "ar" ? "rtl" : "ltr"}>
                    {pendingAttachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1.5 text-[11px]">
                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="max-w-[140px] truncate text-foreground">{att.summary.name}</span>
                        <button type="button" onClick={() => removePendingAttachment(att.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploadingAttachments || recording || pendingAttachments.length >= MAX_PENDING_ATTACHMENTS}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title={t("chat.attach")}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    disabled={(loading || uploadingAttachments) && !recording}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                      recording
                        ? "animate-pulse bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    title={recording ? t("chat.stopRecord") : t("chat.record")}
                  >
                    {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSend()}
                    placeholder={lang === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                    disabled={loading || uploadingAttachments || recording}
                    className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  />

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={(!input.trim() && pendingAttachments.length === 0) || loading || uploadingAttachments}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                      input.trim() || pendingAttachments.length
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-muted text-muted-foreground",
                    )}
                    title={t("chat.send")}
                  >
                    {loading || uploadingAttachments ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className={cn("h-4 w-4", lang === "ar" && "rotate-180")} />
                    )}
                  </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  {lang === "ar" ? "مدعوم بالذكاء الاصطناعي - قد يخطئ أحياناً" : "Powered by AI - May occasionally make mistakes"}
                </p>
              </div>
            </>
          ) : (
            /* Voice Tab */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {ELEVENLABS_AGENT_ID ? (
                <ElevenLabsVoicePanel
                  agentId={ELEVENLABS_AGENT_ID}
                  disabled={loading || uploadingAttachments || recording}
                  onAssistantMessage={appendAssistantMessage}
                  onCreateMaintenanceRequest={sendMaintenanceRequest}
                  onQueryMaintenanceRequest={queryMaintenanceRequest}
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "المحادثة الصوتية غير متاحة حالياً" : "Voice chat is not available yet"}
                  </p>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={loading}
                    className={cn(
                      "mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all shadow-lg",
                      recording
                        ? "animate-pulse bg-destructive text-destructive-foreground scale-110"
                        : "bg-accent text-accent-foreground hover:scale-110",
                    )}
                  >
                    {recording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {recording
                      ? (lang === "ar" ? "جاري التسجيل... اضغط لإيقاف" : "Recording... Click to stop")
                      : (lang === "ar" ? "اضغط للتسجيل الصوتي" : "Click to start recording")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
