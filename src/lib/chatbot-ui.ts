export type ChatRole = "user" | "assistant";

export interface ChatAttachmentSummary {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  storageProvider?: "seafile";
  storagePath?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  attachments?: ChatAttachmentSummary[];
}

export interface ChatConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const CHATBOT_HISTORY_KEY = "luxury-finishing-chatbot-history";
const MAX_CONVERSATION_HISTORY = 20;

export const createChatEntityId = (prefix = "chat") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createChatMessage = (
  role: ChatRole,
  content: string,
  attachments?: ChatAttachmentSummary[],
): ChatMessage => ({
  id: createChatEntityId("message"),
  role,
  content,
  createdAt: new Date().toISOString(),
  attachments: attachments?.length ? attachments : undefined,
});

export const formatAttachmentSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 104857.6) / 10} MB`;
};

const stripMarkdown = (value: string) =>
  value
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildConversationTitle = (messages: ChatMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return "محادثة جديدة";
  }

  const text = stripMarkdown(firstUserMessage.content);
  if (text) {
    return text.length > 42 ? `${text.slice(0, 42)}...` : text;
  }

  if (firstUserMessage.attachments?.length) {
    return `مرفقات: ${firstUserMessage.attachments[0].name}`;
  }

  return "محادثة جديدة";
};

export const hasMeaningfulConversation = (messages: ChatMessage[]) =>
  messages.some(
    (message) =>
      message.role === "user" &&
      (message.content.trim().length > 0 || (message.attachments?.length ?? 0) > 0),
  );

export const createConversationSession = (
  id: string,
  messages: ChatMessage[],
  existing?: ChatConversationSession,
): ChatConversationSession => ({
  id,
  title: buildConversationTitle(messages),
  createdAt: existing?.createdAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages,
});

export const loadConversationHistory = () => {
  if (typeof window === "undefined") {
    return [] as ChatConversationSession[];
  }

  const raw = window.localStorage.getItem(CHATBOT_HISTORY_KEY);
  if (!raw) {
    return [] as ChatConversationSession[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as ChatConversationSession[];
    }

    return parsed.filter((item): item is ChatConversationSession => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          Array.isArray(item.messages),
      );
    });
  } catch {
    return [] as ChatConversationSession[];
  }
};

export const persistConversationHistory = (history: ChatConversationSession[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(history));
};

export const upsertConversationHistory = (
  history: ChatConversationSession[],
  session: ChatConversationSession,
) => {
  const next = [session, ...history.filter((item) => item.id !== session.id)]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, MAX_CONVERSATION_HISTORY);

  persistConversationHistory(next);
  return next;
};

export const removeConversationHistoryEntry = (
  history: ChatConversationSession[],
  id: string,
) => {
  const next = history.filter((item) => item.id !== id);
  persistConversationHistory(next);
  return next;
};

export const clearConversationHistory = () => {
  persistConversationHistory([]);
  return [] as ChatConversationSession[];
};

export const buildAttachmentContext = (attachments: ChatAttachmentSummary[]) => {
  if (!attachments.length) {
    return "";
  }

  const rows = attachments.map(
    (attachment) =>
      `- ${attachment.name} (${formatAttachmentSize(attachment.size)}${attachment.type ? `, ${attachment.type}` : ""})${attachment.url ? ` [الرابط: ${attachment.url}]` : ""}`,
  );

  return `\n\nالمرفقات المرسلة:\n${rows.join("\n")}`;
};

export const buildModelMessageContent = (message: Pick<ChatMessage, "content" | "attachments">) => {
  const content = message.content.trim();
  const attachments = message.attachments ?? [];
  const attachmentContext = buildAttachmentContext(attachments);

  if (!content && attachments.length) {
    return `أرسل المستخدم مرفقات للمراجعة.${attachmentContext}`;
  }

  return `${content}${attachmentContext}`.trim();
};

export const serializeConversationTranscript = (session: ChatConversationSession) => {
  const header = [
    "Luxury Finishing Chat Transcript",
    `Conversation ID: ${session.id}`,
    `Title: ${session.title}`,
    `Created At: ${session.createdAt}`,
    `Updated At: ${session.updatedAt}`,
    "",
  ];

  const rows = session.messages.flatMap((message) => {
    const parts = [
      `[${message.createdAt}] ${message.role === "user" ? "User" : "Assistant"}: ${message.content || "-"}`,
    ];

    if (message.attachments?.length) {
      parts.push(
        ...message.attachments.map(
          (attachment) =>
            `  attachment: ${attachment.name} (${formatAttachmentSize(attachment.size)}${attachment.type ? `, ${attachment.type}` : ""})${attachment.url ? ` [${attachment.url}]` : ""}`,
        ),
      );
    }

    return parts;
  });

  return [...header, ...rows].join("\n");
};

export const buildTranscriptFileName = (session: ChatConversationSession) => {
  const safeTitle = session.title
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 32);

  return `${safeTitle || "chat-transcript"}-${session.updatedAt.slice(0, 10)}.txt`;
};
