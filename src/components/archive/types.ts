// --- Types ---
export type Status = "alive" | "killed" | "missing";

export interface HistoryEntry {
  date: string;
  author: string;
  action: string;
  changes: string;
}

export interface Person {
  id: string;
  fullName: string;
  birthDate: string;       // формат: "YYYY", "YYYY-MM" или "YYYY-MM-DD"
  deathDate: string;       // формат: "YYYY", "YYYY-MM" или "YYYY-MM-DD"
  birthPlace: string;
  awards: string;
  biography: string;
  status: Status;
  photo?: string;
  createdAt: string;
  history: HistoryEntry[];
}

export type FormData = {
  fullName: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  awards: string;
  biography: string;
  status: Status;
  photo: string;
};

// --- Constants ---
export const STATUS_LABELS: Record<Status, string> = {
  alive: "Жив",
  killed: "Убит",
  missing: "Пропал без вести",
};

export const EMPTY_FORM: FormData = {
  fullName: "",
  birthDate: "",
  deathDate: "",
  birthPlace: "",
  awards: "",
  biography: "",
  status: "alive",
  photo: "",
};

// Пустой архив — записи добавляются вручную
export const INITIAL_DATA: Person[] = [];

// --- Utils ---

/** Форматирует частичную дату: "YYYY", "YYYY-MM", "YYYY-MM-DD" */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  const months = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря",
  ];
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (d && m) return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y} г.`;
  if (m) return `${months[parseInt(m) - 1]} ${y} г.`;
  return `${y} г.`;
}

export function getAge(birthDate: string, deathDate?: string): number | null {
  if (!birthDate) return null;
  const birthYear = parseInt(birthDate.split("-")[0]);
  if (!birthYear) return null;
  const endYear = deathDate
    ? parseInt(deathDate.split("-")[0])
    : new Date().getFullYear();
  return endYear - birthYear;
}
