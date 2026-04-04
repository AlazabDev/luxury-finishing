import {
  detectChatIntent,
  isMaintenanceRequestNumber,
  normalizePhoneNumber,
  parsePriority,
  parseServiceType,
} from "@/lib/chatbot";

describe("chatbot helpers", () => {
  it("detects maintenance intents", () => {
    expect(detectChatIntent("أريد تقديم طلب صيانة كهرباء")).toBe("create_maintenance");
    expect(detectChatIntent("ما حالة الطلب MR-25-00042")).toBe("query_maintenance");
    expect(detectChatIntent("ما هي خدماتكم؟")).toBe("general");
  });

  it("normalizes egyptian phone numbers", () => {
    expect(normalizePhoneNumber("+20 1012345678")).toBe("01012345678");
    expect(normalizePhoneNumber("01012345678")).toBe("01012345678");
  });

  it("parses service type and priority", () => {
    expect(parseServiceType("عندي مشكلة سباكة")).toBe("plumbing");
    expect(parsePriority("عاجل جدا")).toBe("high");
  });

  it("validates request number format", () => {
    expect(isMaintenanceRequestNumber("MR-25-00042")).toBe(true);
    expect(isMaintenanceRequestNumber("12345")).toBe(false);
  });
});
