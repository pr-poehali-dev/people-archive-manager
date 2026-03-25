import { useState } from "react";
import Icon from "@/components/ui/icon";
import { type Person, type FormData, type Status, EMPTY_FORM } from "./types";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-ibm uppercase tracking-widest mb-1.5"
        style={{ color: "hsl(var(--ink-light))" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const MONTHS = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

/** Разбирает строку "YYYY", "YYYY-MM" или "YYYY-MM-DD" на части */
function parseDateParts(val: string) {
  const parts = val ? val.split("-") : [];
  return {
    year: parts[0] || "",
    month: parts[1] || "",
    day: parts[2] || "",
  };
}

/** Собирает части обратно в строку, только до последнего заполненного поля */
function buildDateStr(year: string, month: string, day: string): string {
  if (!year) return "";
  if (!month) return year;
  if (!day) return `${year}-${month}`;
  return `${year}-${month}-${day}`;
}

/** Возвращает количество дней в месяце (с учётом года) */
function daysInMonth(year: string, month: string): number {
  const y = parseInt(year) || 2000;
  const m = parseInt(month);
  if (!m) return 31;
  return new Date(y, m, 0).getDate();
}

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function FlexDatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const { year, month, day } = parseDateParts(value);

  const inputStyle: React.CSSProperties = {
    borderColor: "hsl(var(--aged-border))",
    color: "hsl(var(--ink))",
    background: "hsl(var(--parchment))",
  };

  function handleYear(v: string) {
    const y = v.replace(/\D/g, "").slice(0, 4);
    onChange(buildDateStr(y, month, day));
  }

  function handleMonth(v: string) {
    const newDay = day && parseInt(day) > daysInMonth(year, v) ? "" : day;
    onChange(buildDateStr(year, v, newDay));
  }

  function handleDay(v: string) {
    onChange(buildDateStr(year, month, v));
  }

  const maxDay = daysInMonth(year, month);
  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className="flex gap-1.5">
      {/* День */}
      <select
        className="px-2 py-2 text-sm font-ibm border outline-none flex-1"
        style={inputStyle}
        value={day}
        onChange={(e) => handleDay(e.target.value)}
        disabled={!month}
        title={!month ? "Сначала выберите месяц" : ""}
      >
        <option value="">День</option>
        {dayOptions.map((d) => (
          <option key={d} value={String(d).padStart(2, "0")}>
            {d}
          </option>
        ))}
      </select>

      {/* Месяц */}
      <select
        className="px-2 py-2 text-sm font-ibm border outline-none flex-[2]"
        style={inputStyle}
        value={month}
        onChange={(e) => handleMonth(e.target.value)}
        disabled={!year}
        title={!year ? "Сначала введите год" : ""}
      >
        <option value="">Месяц</option>
        {MONTHS.map((name, i) => {
          const val = String(i + 1).padStart(2, "0");
          return <option key={val} value={val}>{name}</option>;
        })}
      </select>

      {/* Год */}
      <input
        type="text"
        inputMode="numeric"
        className="px-2 py-2 text-sm font-ibm border outline-none w-16"
        style={inputStyle}
        value={year}
        onChange={(e) => handleYear(e.target.value)}
        placeholder={placeholder || "Год"}
        maxLength={4}
      />
    </div>
  );
}

export function PersonForm({
  initial,
  onSave,
  onCancel,
}: {
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
          <label
            className="block w-24 h-28 border cursor-pointer relative overflow-hidden"
            style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="фото" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <Icon name="Camera" size={22} style={{ color: "hsl(var(--muted-foreground))" }} />
                <span
                  className="text-xs text-center font-ibm leading-tight px-1"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Добавить фото
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhoto}
            />
          </label>
        </div>
        <div className="flex-1 space-y-3">
          <FormField label="ФИО *">
            <input
              className="w-full px-3 py-2 text-sm font-ibm border outline-none transition-colors"
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
              onChange={(e) => set("status", e.target.value as Status)}
            >
              <option value="alive">Жив</option>
              <option value="killed">Убит</option>
              <option value="missing">Пропал без вести</option>
            </select>
          </FormField>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Дата рождения">
          <FlexDatePicker
            value={form.birthDate}
            onChange={(v) => set("birthDate", v)}
            placeholder="Год"
          />
        </FormField>
        <FormField label="Дата смерти">
          <FlexDatePicker
            value={form.deathDate}
            onChange={(v) => set("deathDate", v)}
            placeholder="Год"
          />
        </FormField>
      </div>

      <FormField label="Место рождения">
        <input
          className="w-full px-3 py-2 text-sm font-ibm border outline-none"
          style={inputStyle}
          value={form.birthPlace}
          onChange={(e) => set("birthPlace", e.target.value)}
          placeholder="Город, регион"
        />
      </FormField>

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
          style={{ background: "hsl(var(--ink))", color: "hsl(var(--primary-foreground))" }}
        >
          <Icon name="Save" size={14} />
          Сохранить запись
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-ibm border transition-colors hover:bg-secondary"
          style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
