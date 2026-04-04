import {
  buildConversationTitle,
  buildModelMessageContent,
  buildTranscriptFileName,
  createConversationSession,
  createChatMessage,
  formatAttachmentSize,
  hasMeaningfulConversation,
} from "@/lib/chatbot-ui";

describe("chatbot ui helpers", () => {
  it("builds a clean title from the first user message", () => {
    const title = buildConversationTitle([
      createChatMessage("assistant", "مرحباً"),
      createChatMessage("user", "**أحتاج** عرض سعر لتشطيب شقة بالكامل"),
    ]);

    expect(title).toContain("أحتاج");
    expect(title).not.toContain("**");
  });

  it("detects meaningful conversations", () => {
    expect(hasMeaningfulConversation([createChatMessage("assistant", "مرحباً")])).toBe(false);
    expect(hasMeaningfulConversation([createChatMessage("user", "مرحبا")])).toBe(true);
  });

  it("appends attachment metadata to model content", () => {
    const content = buildModelMessageContent({
      content: "راجع هذه الملفات",
      attachments: [{ id: "a1", name: "plan.pdf", size: 2048, type: "application/pdf" }],
    });

    expect(content).toContain("راجع هذه الملفات");
    expect(content).toContain("plan.pdf");
  });

  it("creates transcript filenames and sizes", () => {
    const session = createConversationSession("c1", [createChatMessage("user", "مرحبا")]);

    expect(buildTranscriptFileName(session)).toMatch(/\.txt$/);
    expect(formatAttachmentSize(2048)).toBe("2 KB");
  });
});
