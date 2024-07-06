import crypto from "crypto";

export const hashCredential = (value: string, salt: string): string => {
  const valueWithSalt = `${salt}${value}`;
  const hash = crypto.createHash("sha256").update(valueWithSalt).digest("hex");
  const trimmedHash = hash.substring(0, 56);
  return trimmedHash + salt;
};


export const generateSalt = (length: number = 4) => {
  return crypto.randomBytes(length).toString("hex");
};
