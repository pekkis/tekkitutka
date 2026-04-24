import { customAlphabet } from "nanoid";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const LENGTH = 12;

const nano = customAlphabet(ALPHABET, LENGTH);

export function generatePublicId(): string {
  return nano();
}

export const PUBLIC_ID_LENGTH = LENGTH;
