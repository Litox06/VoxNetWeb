import crypto from "crypto";

export const hashCredential = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};