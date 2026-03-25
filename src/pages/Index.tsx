import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// --- Types ---
type Status = "alive" | "killed" | "missing";

interface HistoryEntry {
  date: string;
  author: string;
  action: string;
  changes: string;
}

interface Person {
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

type FormData = {
  fullName: string;
  birthDate: string;
  birthPlace: string;
  awards: string;
  biography: string;
  status: Status;
  photo: string;
};

// --- Mock data ---
const INITIAL_DATA: Person[] = [
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

const STATUS_LABELS: Record<Status, string> = {
  alive: "Жив",
  killed: "Убит",
  missing: "Пропал без вести",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y} г.`;
}

function getAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// --- Status Badge ---
function StatusBadge({ status }: { status: Status }) {
  const cls = {
    alive: "text-emerald-700 border-emerald-600 bg-emerald-50",
    killed: "text-red-700 border-red-600 bg-red-50",
    missing: "text-amber-700 border-amber-600 bg-amber-50",
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-ibm uppercase tracking-widest ${cls}`}
      style={{ letterSpacing: "0.12em" }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// --- Person Card ---
function PersonCard({ person, onClick }: { person: Person; onClick: () => void }) {
  const barColor = person.status === "alive" ? "hsl(140 35% 32%)" : person.status === "killed" ? "hsl(0 55% 42%)" : "hsl(42 60% 38%)";
  return (
    <div
      onClick={onClick}
      className="archive-border bg-card hover-card-lift cursor-pointer animate-slide-up p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: barColor }} />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-cormorant font-semibold text-lg leading-tight truncate" style={{ color: "hsl(var(--ink))" }}>
              {person.fullName}
            </h3>
            <p className="text-xs font-ibm mt-0.5" style={{ color: "hsl(var(--ink-light))" }}>
              {person.birthDate ? formatDate(person.birthDate) : "Дата неизвестна"}
            </p>
            {person.birthPlace && (
              <p className="text-xs font-ibm truncate" style={{ color: "hsl(var(--ink-light))" }}>{person.birthPlace}</p>
            )}
          </div>
          {person.photo ? (
            <img src={person.photo} alt={person.fullName} className="w-12 h-14 object-cover flex-shrink-0 border"
              style={{ borderColor: "hsl(var(--aged-border))" }} />
          ) : (
            <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center border"
              style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}>
              <Icon name="User" size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>
          )}
        </div>
        {person.awards && (
          <p className="text-xs font-ibm mb-2 line-clamp-1" style={{ color: "hsl(var(--ink-light))" }}>
            <span className="font-medium">Награды:</span> {person.awards.split("\n")[0]}
            {person.awards.split("\n").length > 1 && " и др."}
          </p>
        )}
        <div className="flex items-center justify-between">
          <StatusBadge status={person.status} />
          <span className="text-xs font-ibm" style={{ color: "hsl(var(--muted-foreground))" }}>
            № {person.id.padStart(4, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Person Detail Modal ---
function PersonModal({ person, onClose, onEdit, onDelete }: {
  person: Person;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<"info" | "history">("info");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "hsl(var(--ink) / 0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{ background: "hsl(var(--parchment))", border: "1px solid hsl(var(--aged-border))" }}>
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: "hsl(var(--aged-border))" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              {person.photo ? (
                <img src={person.photo} alt={person.fullName} className="w-16 h-20 object-cover border flex-shrink-0"
                  style={{ borderColor: "hsl(var(--aged-border))" }} />
              ) : (
                <div className="w-16 h-20 flex items-center justify-center border flex-shrink-0"
                  style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}>
                  <Icon name="User" size={28} style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              )}
              <div>
                <p className="text-xs font-ibm tracking-widest uppercase mb-1" style={{ color: "hsl(var(--ink-light))" }}>
                  Дело № {person.id.padStart(4, "0")}
                </p>
                <h2 className="font-cormorant font-semibold text-2xl leading-tight" style={{ color: "hsl(var(--ink))" }}>
                  {person.fullName}
                </h2>
                <div className="mt-1.5">
                  <StatusBadge status={person.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity flex-shrink-0">
              <Icon name="X" size={18} style={{ color: "hsl(var(--ink-light))" }} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "hsl(var(--aged-border))" }}>
          {(["info", "history"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-ibm transition-colors ${tab === t ? "border-b-2 font-medium" : "opacity-50"}`}
              style={{ borderColor: tab === t ? "hsl(var(--ink))" : "transparent", color: "hsl(var(--ink))" }}>
              {t === "info" ? "Сведения" : `История (${person.history.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === "info" && (
            <div className="space-y-4">
              <InfoRow label="ФИО" value={person.fullName} />
              <InfoRow label="Дата рождения" value={person.birthDate ? formatDate(person.birthDate) : "—"} />
              {person.birthDate && (
                <InfoRow label="Возраст" value={`${getAge(person.birthDate)} лет`} />
              )}
              <InfoRow label="Место рождения" value={person.birthPlace || "—"} />
              <InfoRow label="Статус" value={STATUS_LABELS[person.status]} />
              <div>
                <p className="text-xs font-ibm uppercase tracking-widest mb-1.5" style={{ color: "hsl(var(--ink-light))" }}>
                  Награды
                </p>
                {person.awards ? (
                  <div className="space-y-1">
                    {person.awards.split("\n").filter(Boolean).map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-base leading-5">✦</span>
                        <p className="font-ibm text-sm" style={{ color: "hsl(var(--ink))" }}>{a}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-ibm text-sm italic" style={{ color: "hsl(var(--muted-foreground))" }}>Нет сведений</p>
                )}
              </div>
              <div>
                <p className="text-xs font-ibm uppercase tracking-widest mb-1.5" style={{ color: "hsl(var(--ink-light))" }}>
                  Биография
                </p>
                {person.biography ? (
                  <p className="font-ibm text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(var(--ink))" }}>
                    {person.biography}
                  </p>
                ) : (
                  <p className="font-ibm text-sm italic" style={{ color: "hsl(var(--muted-foreground))" }}>Биография не указана</p>
                )}
              </div>
              <InfoRow label="Дата внесения в архив" value={person.createdAt ? formatDate(person.createdAt) : "—"} />
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {person.history.length === 0 ? (
                <p className="text-sm font-ibm italic text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                  История изменений пуста
                </p>
              ) : (
                [...person.history].reverse().map((h, i) => (
                  <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: "hsl(var(--aged-border))" }}>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-ibm font-medium" style={{ color: "hsl(var(--ink))" }}>{h.action}</span>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{formatDate(h.date)}</span>
                    </div>
                    <p className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>{h.changes}</p>
                    <p className="text-xs mt-0.5 font-ibm italic" style={{ color: "hsl(var(--muted-foreground))" }}>— {h.author}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-0">
          {confirmDelete ? (
            <>
              <p className="text-sm font-ibm flex-1" style={{ color: "hsl(var(--destructive))" }}>
                Удалить запись навсегда?
              </p>
              <button onClick={onDelete}
                className="px-3 py-2 text-sm font-ibm"
                style={{ background: "hsl(var(--destructive))", color: "white" }}>
                Да, удалить
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 text-sm font-ibm border"
                style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}>
                Отмена
              </button>
            </>
          ) : (
            <>
              <button onClick={onEdit}
                className="flex-1 py-2 text-sm font-ibm border flex items-center justify-center gap-1.5 transition-colors hover:bg-secondary"
                style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}>
                <Icon name="Pencil" size={14} />
                Редактировать
              </button>
              <button onClick={() => setConfirmDelete(true)}
                className="py-2 px-4 text-sm font-ibm border flex items-center justify-center gap-1.5 transition-colors hover:bg-red-50"
                style={{ borderColor: "hsl(var(--destructive) / 0.5)", color: "hsl(var(--destructive))" }}>
                <Icon name="Trash2" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-ibm uppercase tracking-widest mb-0.5" style={{ color: "hsl(var(--ink-light))" }}>{label}</p>
      <p className="font-ibm text-sm" style={{ color: "hsl(var(--ink))" }}>{value}</p>
    </div>
  );
}

// --- Add / Edit Form ---
const EMPTY_FORM: FormData = {
  fullName: "",
  birthDate: "",
  birthPlace: "",
  awards: "",
  biography: "",
  status: "alive",
  photo: "",
};

function PersonForm({ initial, onSave, onCancel }: {
  initial?: Partial<Person>;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ...initial });
  const [photoPreview, setPhotoPreview] = useState(initial?.photo || "");

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      setForm((f) => ({ ...f, photo: url }));
    };
    reader.readAsDataURL(file);
  }

  const set = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputStyle: React.CSSProperties = {
    borderColor: "hsl(var(--aged-border))",
    color: "hsl(var(--ink))",
    background: "transparent",
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <label className="block w-24 h-28 border cursor-pointer relative overflow-hidden"
            style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}>
            {photoPreview ? (
              <img src={photoPreview} alt="фото" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <Icon name="Camera" size={22} style={{ color: "hsl(var(--muted-foreground))" }} />
                <span className="text-xs text-center font-ibm leading-tight px-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Добавить фото
                </span>
              </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhoto} />
          </label>
        </div>
        <div className="flex-1 space-y-3">
          <FormField label="ФИО *">
            <input
              className="w-full px-3 py-2 text-sm font-ibm border outline-none focus:border-ink transition-colors"
              style={inputStyle}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Фамилия Имя Отчество"
            />
          </FormField>
          <FormField label="Статус">
            <select
              className="w-full px-3 py-2 text-sm font-ibm border outline-none"
              style={{ ...inputStyle, background: "hsl(var(--parchment))" }}
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}>
              <option value="alive">Жив</option>
              <option value="killed">Убит</option>
              <option value="missing">Пропал без вести</option>
            </select>
          </FormField>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Дата рождения">
          <input
            type="date"
            className="w-full px-3 py-2 text-sm font-ibm border outline-none"
            style={inputStyle}
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </FormField>
        <FormField label="Место рождения">
          <input
            className="w-full px-3 py-2 text-sm font-ibm border outline-none"
            style={inputStyle}
            value={form.birthPlace}
            onChange={(e) => set("birthPlace", e.target.value)}
            placeholder="Город, регион"
          />
        </FormField>
      </div>

      <FormField label="Награды (каждая с новой строки)">
        <textarea
          className="w-full px-3 py-2 text-sm font-ibm border outline-none resize-none"
          style={inputStyle}
          rows={3}
          value={form.awards}
          onChange={(e) => set("awards", e.target.value)}
          placeholder={"Орден Красной Звезды\nМедаль За отвагу"}
        />
      </FormField>

      <FormField label="Биография">
        <textarea
          className="w-full px-3 py-2 text-sm font-ibm border outline-none resize-y"
          style={{ ...inputStyle, minHeight: "120px" }}
          rows={5}
          value={form.biography}
          onChange={(e) => set("biography", e.target.value)}
          placeholder="Краткое жизнеописание, сведения о службе, деятельности, событиях жизни..."
        />
      </FormField>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={!form.fullName.trim()}
          className="flex-1 py-2.5 text-sm font-ibm font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ background: "hsl(var(--ink))", color: "hsl(var(--primary-foreground))" }}>
          <Icon name="Save" size={14} />
          Сохранить запись
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 text-sm font-ibm border transition-colors hover:bg-secondary"
          style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}>
          Отмена
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-ibm uppercase tracking-widest mb-1.5" style={{ color: "hsl(var(--ink-light))" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// --- Header ---
function AppHeader({ page, onNav, total }: { page: string; onNav: (p: string) => void; total: number }) {
  const navItems = [
    { id: "home", label: "Главная", icon: "BookOpen" },
    { id: "add", label: "Добавить", icon: "PlusCircle" },
    { id: "search", label: "Поиск", icon: "Search" },
    { id: "stats", label: "Статистика", icon: "BarChart2" },
  ];
  return (
    <header className="border-b sticky top-0 z-40" style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--parchment))" }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <button onClick={() => onNav("home")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 flex items-center justify-center border" style={{ borderColor: "hsl(var(--aged-border))" }}>
              <Icon name="Archive" size={17} style={{ color: "hsl(var(--ink))" }} />
            </div>
            <div>
              <h1 className="font-cormorant font-semibold text-xl leading-none" style={{ color: "hsl(var(--ink))" }}>
                Архив памяти
              </h1>
              <p className="text-xs font-ibm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {total} {total === 1 ? "запись" : total < 5 ? "записи" : "записей"}
              </p>
            </div>
          </button>
          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                title={item.label}
                className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-2 text-xs font-ibm transition-colors relative"
                style={{ color: page === item.id ? "hsl(var(--ink))" : "hsl(var(--muted-foreground))" }}>
                <Icon name={item.icon} size={15} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-[9px]">{item.label}</span>
                {page === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5"
                    style={{ background: "hsl(var(--ink))" }} />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// --- Home Page ---
function HomePage({ people, onView, onAdd }: {
  people: Person[];
  onView: (p: Person) => void;
  onAdd: () => void;
}) {
  const [sort, setSort] = useState<"name" | "birth" | "status">("name");

  const sorted = useMemo(() => {
    return [...people].sort((a, b) => {
      if (sort === "birth") return (a.birthDate || "").localeCompare(b.birthDate || "");
      if (sort === "status") return a.status.localeCompare(b.status);
      return a.fullName.localeCompare(b.fullName, "ru");
    });
  }, [people, sort]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="divider-ornamental mb-1">
            <span className="text-xs font-ibm tracking-widest uppercase" style={{ color: "hsl(var(--aged-border))" }}>Реестр дел</span>
          </div>
          <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
            Все записи
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>Сортировка:</span>
          {(["name", "birth", "status"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)}
              className="px-2.5 py-1 text-xs font-ibm border transition-colors"
              style={{
                borderColor: "hsl(var(--aged-border))",
                background: sort === s ? "hsl(var(--ink))" : "transparent",
                color: sort === s ? "hsl(var(--primary-foreground))" : "hsl(var(--ink))",
                opacity: sort === s ? 1 : 0.6,
              }}>
              {s === "name" ? "По ФИО" : s === "birth" ? "По дате" : "По статусу"}
            </button>
          ))}
        </div>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-16 archive-border">
          <Icon name="BookOpen" size={40} style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }} />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>Архив пуст</p>
          <p className="text-sm font-ibm mt-2 mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
            Добавьте первую запись в архив
          </p>
          <button onClick={onAdd}
            className="px-4 py-2 text-sm font-ibm"
            style={{ background: "hsl(var(--ink))", color: "hsl(var(--primary-foreground))" }}>
            Добавить запись
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p) => (
            <PersonCard key={p.id} person={p} onClick={() => onView(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Add / Edit Page ---
function FormPage({ title, subtitle, initial, onSave, onCancel }: {
  title: string;
  subtitle: string;
  initial?: Partial<Person>;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="divider-ornamental mb-1">
          <span className="text-xs font-ibm tracking-widest uppercase" style={{ color: "hsl(var(--aged-border))" }}>{subtitle}</span>
        </div>
        <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
          {title}
        </h2>
      </div>
      <div className="archive-border p-5 relative">
        <div className="absolute top-3 right-4 text-xs font-ibm opacity-30 font-cormorant italic pointer-events-none" style={{ color: "hsl(var(--ink))" }}>
          Форма № А-{new Date().getFullYear()}-{String(Date.now()).slice(-4)}
        </div>
        <PersonForm initial={initial} onSave={onSave} onCancel={onCancel} />
      </div>
    </div>
  );
}

// --- Search Page ---
function SearchPage({ people, onView }: { people: Person[]; onView: (p: Person) => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const results = useMemo(() => {
    return people.filter((p) => {
      const q = query.toLowerCase();
      const matchName = !q || p.fullName.toLowerCase().includes(q) || p.birthPlace.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [people, query, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="divider-ornamental mb-1">
          <span className="text-xs font-ibm tracking-widest uppercase" style={{ color: "hsl(var(--aged-border))" }}>Картотека</span>
        </div>
        <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
          Поиск
        </h2>
      </div>

      <div className="archive-border p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "hsl(var(--aged-border))" }}>
          <Icon name="Search" size={16} style={{ color: "hsl(var(--ink-light))" }} />
          <input
            className="flex-1 bg-transparent text-sm font-ibm outline-none"
            style={{ color: "hsl(var(--ink))" }}
            placeholder="Поиск по ФИО или месту рождения..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="opacity-60 hover:opacity-100 transition-opacity">
              <Icon name="X" size={14} style={{ color: "hsl(var(--ink))" }} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>Статус:</span>
          {([
            { v: "all", label: "Все" },
            { v: "alive", label: "Жив" },
            { v: "killed", label: "Убит" },
            { v: "missing", label: "Пропал" },
          ] as const).map(({ v, label }) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className="px-2.5 py-1 text-xs font-ibm border transition-colors"
              style={{
                borderColor: "hsl(var(--aged-border))",
                background: statusFilter === v ? "hsl(var(--ink))" : "transparent",
                color: statusFilter === v ? "hsl(var(--primary-foreground))" : "hsl(var(--ink))",
                opacity: statusFilter === v ? 1 : 0.6,
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-ibm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
        Найдено: {results.length} {results.length === 1 ? "запись" : results.length < 5 ? "записи" : "записей"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="FileSearch" size={36} style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }} />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>Ничего не найдено</p>
          <p className="text-sm font-ibm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Попробуйте изменить запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p) => (
            <PersonCard key={p.id} person={p} onClick={() => onView(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Stats Page ---
function StatsPage({ people }: { people: Person[] }) {
  const alive = people.filter((p) => p.status === "alive").length;
  const killed = people.filter((p) => p.status === "killed").length;
  const missing = people.filter((p) => p.status === "missing").length;
  const total = people.length;
  const withAwards = people.filter((p) => p.awards.trim()).length;
  const withPhoto = people.filter((p) => p.photo).length;

  function pct(n: number) {
    return total ? Math.round((n / total) * 100) : 0;
  }

  const statCards = [
    { label: "Всего записей", value: total, icon: "Users", color: "hsl(var(--ink))" },
    { label: "Живы", value: alive, icon: "Heart", color: "hsl(140 35% 32%)" },
    { label: "Убиты", value: killed, icon: "Sword", color: "hsl(0 55% 42%)" },
    { label: "Пропали", value: missing, icon: "HelpCircle", color: "hsl(42 60% 38%)" },
    { label: "С наградами", value: withAwards, icon: "Star", color: "hsl(var(--ink))" },
    { label: "С фото", value: withPhoto, icon: "Camera", color: "hsl(var(--ink))" },
  ];

  const bars = [
    { label: "Живы", value: alive, p: pct(alive), color: "hsl(140 35% 32%)" },
    { label: "Убиты", value: killed, p: pct(killed), color: "hsl(0 55% 42%)" },
    { label: "Пропали", value: missing, p: pct(missing), color: "hsl(42 60% 38%)" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="divider-ornamental mb-1">
          <span className="text-xs font-ibm tracking-widest uppercase" style={{ color: "hsl(var(--aged-border))" }}>Сводка</span>
        </div>
        <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
          Статистика
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="archive-border p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={icon} size={15} style={{ color }} />
              <span className="text-xs font-ibm uppercase tracking-wide" style={{ color: "hsl(var(--ink-light))" }}>{label}</span>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="archive-border p-5">
          <h3 className="font-cormorant text-xl font-semibold mb-5" style={{ color: "hsl(var(--ink))" }}>
            Распределение по статусу
          </h3>
          <div className="space-y-5">
            {bars.map(({ label, value, p, color }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm font-ibm" style={{ color: "hsl(var(--ink))" }}>{label}</span>
                  <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>
                    {value} чел. · {p}%
                  </span>
                </div>
                <div className="h-2 w-full" style={{ background: "hsl(var(--muted))" }}>
                  <div className="h-2 transition-all duration-700" style={{ width: `${p}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-12 archive-border">
          <Icon name="BarChart2" size={36} style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }} />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>Нет данных</p>
          <p className="text-sm font-ibm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Добавьте записи для отображения статистики</p>
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [page, setPage] = useState("home");
  const [people, setPeople] = useState<Person[]>(INITIAL_DATA);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const authorName = "Пользователь";

  function navTo(p: string) {
    setEditingPerson(null);
    setSelectedPerson(null);
    setPage(p);
  }

  function handleAdd(data: FormData) {
    const now = new Date().toISOString().split("T")[0];
    const newPerson: Person = {
      ...data,
      id: String(Date.now()),
      createdAt: now,
      history: [
        { date: now, author: authorName, action: "Создание записи", changes: "Первичная запись внесена в архив" }
      ],
    };
    setPeople((p) => [newPerson, ...p]);
    setPage("home");
  }

  function handleEdit(data: FormData) {
    if (!editingPerson) return;
    const now = new Date().toISOString().split("T")[0];
    const changes: string[] = [];
    if (data.fullName !== editingPerson.fullName) changes.push(`ФИО: «${editingPerson.fullName}» → «${data.fullName}»`);
    if (data.status !== editingPerson.status) changes.push(`Статус: ${STATUS_LABELS[editingPerson.status]} → ${STATUS_LABELS[data.status as Status]}`);
    if (data.birthDate !== editingPerson.birthDate) changes.push("Дата рождения изменена");
    if (data.birthPlace !== editingPerson.birthPlace) changes.push("Место рождения изменено");
    if (data.awards !== editingPerson.awards) changes.push("Сведения о наградах обновлены");
    if (data.biography !== editingPerson.biography) changes.push("Биография обновлена");
    if (data.photo !== editingPerson.photo) changes.push("Фотография обновлена");

    const histEntry: HistoryEntry = {
      date: now,
      author: authorName,
      action: "Редактирование",
      changes: changes.length ? changes.join("; ") : "Незначительные правки",
    };

    const updated: Person = {
      ...editingPerson,
      ...data,
      status: data.status as Status,
      history: [...editingPerson.history, histEntry],
    };

    setPeople((p) => p.map((x) => (x.id === updated.id ? updated : x)));
    setEditingPerson(null);
    setSelectedPerson(updated);
  }

  function handleDelete(id: string) {
    setPeople((p) => p.filter((x) => x.id !== id));
    setSelectedPerson(null);
  }

  const currentPage = editingPerson ? "add" : page;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <AppHeader page={currentPage} onNav={navTo} total={people.length} />

      <main>
        {editingPerson ? (
          <FormPage
            title="Редактировать запись"
            subtitle="Правка дела"
            initial={editingPerson}
            onSave={handleEdit}
            onCancel={() => setEditingPerson(null)}
          />
        ) : page === "home" ? (
          <HomePage people={people} onView={setSelectedPerson} onAdd={() => setPage("add")} />
        ) : page === "add" ? (
          <FormPage
            title="Добавить запись"
            subtitle="Новое дело"
            onSave={handleAdd}
            onCancel={() => setPage("home")}
          />
        ) : page === "search" ? (
          <SearchPage people={people} onView={setSelectedPerson} />
        ) : page === "stats" ? (
          <StatsPage people={people} />
        ) : null}
      </main>

      {selectedPerson && !editingPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onEdit={() => { setEditingPerson(selectedPerson); setSelectedPerson(null); }}
          onDelete={() => handleDelete(selectedPerson.id)}
        />
      )}
    </div>
  );
}