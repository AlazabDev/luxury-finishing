const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const timingSafeEqual = (left: string, right: string) => {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) return false;

  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }

  return result === 0;
};

export const createHmacSignature = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
};

export const verifyRequestWithTokenOrSecret = async ({
  req,
  rawBody,
  token,
  secret,
}: {
  req: Request;
  rawBody: string;
  token?: string;
  secret?: string;
}) => {
  const bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const directToken =
    req.headers.get("x-api-key")?.trim() ||
    req.headers.get("x-hook-token")?.trim() ||
    req.headers.get("x-auth-token")?.trim();
  const secretHeader =
    req.headers.get("x-webhook-secret")?.trim() ||
    req.headers.get("x-auth-secret")?.trim();
  const signatureHeader = req.headers.get("x-signature")?.trim();

  if (token && (bearerToken || directToken)) {
    const provided = bearerToken || directToken || "";
    if (timingSafeEqual(provided, token)) return true;
  }

  if (secret && secretHeader && timingSafeEqual(secretHeader, secret)) {
    return true;
  }

  if (secret && signatureHeader) {
    const computed = await createHmacSignature(secret, rawBody);
    const normalizedSignature = signatureHeader.replace(/^sha256=/i, "");
    if (timingSafeEqual(normalizedSignature, computed)) {
      return true;
    }
  }

  return false;
};
