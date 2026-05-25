import { type ClassValue, clsx } from "clsx";

// Small className helper. It lets components conditionally join Tailwind
// classes without manually building strings.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Keeps column counts readable while avoiding repeated pluralization logic.
export function formatCount(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
