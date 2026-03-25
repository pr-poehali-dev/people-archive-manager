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
  birthDate: string;
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
  birthPlace: "",
  awards: "",
  biography: "",
  status: "alive",
  photo: "",
};

// --- Mock data ---
export const INITIAL_DATA: Person[] = [
  {
    id: "1",
    fullName: "Петров Иван Сергеевич",
    birthDate: "1920-03-15",
    birthPlace: "г. Тула, Россия",
    awards: "Орден Красной Звезды\nМедаль «За отвагу»",
    biography: "Участник Великой Отечественной войны. Призван в июне 1941 года. Служил в составе 154-й стрелковой дивизии. Проявил героизм в боях под Москвой в декабре 1941 года.",
    status: "killed",
    createdAt: "1945-05-09",
    history: [
      { date: "1945-05-09", author: "Архивариус Смирнов А.В.", action: "Создание записи", changes: "Первичная запись внесена в архив" },
    ],
  },
  {
    id: "2",
    fullName: "Кузнецова Мария Фёдоровна",
    birthDate: "1918-07-22",
    birthPlace: "г. Воронеж, Россия",
    awards: "Медаль «За трудовую доблесть»",
    biography: "Работала медицинской сестрой в военном госпитале № 3 с 1941 по 1945 год. После войны вернулась в Воронеж, преподавала в медицинском училище.",
    status: "alive",
    createdAt: "1945-06-01",
    history: [
      { date: "1945-06-01", author: "Архивариус Смирнов А.В.", action: "Создание записи", changes: "Первичная запись внесена в архив" },
      { date: "1946-02-14", author: "Архивариус Белова Е.Н.", action: "Редактирование", changes: "Обновлены сведения о наградах" },
    ],
  },
  {
    id: "3",
    fullName: "Орлов Дмитрий Константинович",
    birthDate: "1922-11-08",
    birthPlace: "г. Смоленск, Россия",
    awards: "",
    biography: "",
    status: "missing",
    createdAt: "1945-07-10",
    history: [
      { date: "1945-07-10", author: "Архивариус Смирнов А.В.", action: "Создание записи", changes: "Первичная запись внесена в архив" },
    ],
  },
];

// --- Utils ---
export function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y} г.`;
}

export function getAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
