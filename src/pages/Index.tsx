import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  type Person,
  type FormData,
  formatDate,
} from "@/components/archive/types";
import { PersonCard } from "@/components/archive/PersonCard";
import { PersonModal } from "@/components/archive/PersonModal";
import { PersonForm } from "@/components/archive/PersonForm";
import { usePersonsApi } from "@/components/archive/usePersonsApi";

// --- App Header ---
function AppHeader({ page, onNav, total }: { page: string; onNav: (p: string) => void; total: number }) {
  const navItems = [
    { id: "home", label: "Главная", icon: "BookOpen" },
    { id: "add", label: "Добавить", icon: "PlusCircle" },
    { id: "search", label: "Поиск", icon: "Search" },
    { id: "stats", label: "Статистика", icon: "BarChart2" },
  ];
  return (
    <header
      className="border-b sticky top-0 z-40"
      style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--parchment))" }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => onNav("home")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-9 h-9 flex items-center justify-center border"
              style={{ borderColor: "hsl(var(--aged-border))" }}
            >
              <Icon name="Archive" size={17} style={{ color: "hsl(var(--ink))" }} />
            </div>
            <div>
              <h1
                className="font-cormorant font-semibold text-xl leading-none"
                style={{ color: "hsl(var(--ink))" }}
              >
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
                style={{ color: page === item.id ? "hsl(var(--ink))" : "hsl(var(--muted-foreground))" }}
              >
                <Icon name={item.icon} size={15} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-[9px]">{item.label}</span>
                {page === item.id && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5"
                    style={{ background: "hsl(var(--ink))" }}
                  />
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
            <span
              className="text-xs font-ibm tracking-widest uppercase"
              style={{ color: "hsl(var(--aged-border))" }}
            >
              Реестр дел
            </span>
          </div>
          <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
            Все записи
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>
            Сортировка:
          </span>
          {(["name", "birth", "status"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-2.5 py-1 text-xs font-ibm border transition-colors"
              style={{
                borderColor: "hsl(var(--aged-border))",
                background: sort === s ? "hsl(var(--ink))" : "transparent",
                color: sort === s ? "hsl(var(--primary-foreground))" : "hsl(var(--ink))",
                opacity: sort === s ? 1 : 0.6,
              }}
            >
              {s === "name" ? "По ФИО" : s === "birth" ? "По дате" : "По статусу"}
            </button>
          ))}
        </div>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-16 archive-border">
          <Icon
            name="BookOpen"
            size={40}
            style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }}
          />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>
            Архив пуст
          </p>
          <p className="text-sm font-ibm mt-2 mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
            Добавьте первую запись в архив
          </p>
          <button
            onClick={onAdd}
            className="px-4 py-2 text-sm font-ibm"
            style={{ background: "hsl(var(--ink))", color: "hsl(var(--primary-foreground))" }}
          >
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
function FormPage({ title, subtitle, initial, onSave, onCancel, saving }: {
  title: string;
  subtitle: string;
  initial?: Partial<Person>;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="divider-ornamental mb-1">
          <span
            className="text-xs font-ibm tracking-widest uppercase"
            style={{ color: "hsl(var(--aged-border))" }}
          >
            {subtitle}
          </span>
        </div>
        <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
          {title}
        </h2>
      </div>
      <div className="archive-border p-5 relative">
        <div
          className="absolute top-3 right-4 text-xs font-ibm opacity-30 font-cormorant italic pointer-events-none"
          style={{ color: "hsl(var(--ink))" }}
        >
          Форма № А-{new Date().getFullYear()}-{String(Date.now()).slice(-4)}
        </div>
        <PersonForm initial={initial} onSave={onSave} onCancel={onCancel} saving={saving} />
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
      const matchName =
        !q || p.fullName.toLowerCase().includes(q) || p.birthPlace.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [people, query, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="divider-ornamental mb-1">
          <span
            className="text-xs font-ibm tracking-widest uppercase"
            style={{ color: "hsl(var(--aged-border))" }}
          >
            Картотека
          </span>
        </div>
        <h2 className="font-cormorant text-3xl font-semibold" style={{ color: "hsl(var(--ink))" }}>
          Поиск
        </h2>
      </div>

      <div className="archive-border p-4 mb-6 space-y-3">
        <div
          className="flex items-center gap-2 border-b pb-3"
          style={{ borderColor: "hsl(var(--aged-border))" }}
        >
          <Icon name="Search" size={16} style={{ color: "hsl(var(--ink-light))" }} />
          <input
            className="flex-1 bg-transparent text-sm font-ibm outline-none"
            style={{ color: "hsl(var(--ink))" }}
            placeholder="Поиск по ФИО или месту рождения..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <Icon name="X" size={14} style={{ color: "hsl(var(--ink))" }} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>
            Статус:
          </span>
          {([
            { v: "all", label: "Все" },
            { v: "alive", label: "Жив" },
            { v: "killed", label: "Убит" },
            { v: "missing", label: "Пропал" },
          ] as const).map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="px-2.5 py-1 text-xs font-ibm border transition-colors"
              style={{
                borderColor: "hsl(var(--aged-border))",
                background: statusFilter === v ? "hsl(var(--ink))" : "transparent",
                color: statusFilter === v ? "hsl(var(--primary-foreground))" : "hsl(var(--ink))",
                opacity: statusFilter === v ? 1 : 0.6,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-ibm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
        Найдено: {results.length}{" "}
        {results.length === 1 ? "запись" : results.length < 5 ? "записи" : "записей"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            name="FileSearch"
            size={36}
            style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }}
          />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>
            Ничего не найдено
          </p>
          <p className="text-sm font-ibm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Попробуйте изменить запрос
          </p>
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
          <span
            className="text-xs font-ibm tracking-widest uppercase"
            style={{ color: "hsl(var(--aged-border))" }}
          >
            Сводка
          </span>
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
              <span
                className="text-xs font-ibm uppercase tracking-wide"
                style={{ color: "hsl(var(--ink-light))" }}
              >
                {label}
              </span>
            </div>
            <p className="font-cormorant text-4xl font-semibold" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="archive-border p-5">
          <h3
            className="font-cormorant text-xl font-semibold mb-5"
            style={{ color: "hsl(var(--ink))" }}
          >
            Распределение по статусу
          </h3>
          <div className="space-y-5">
            {bars.map(({ label, value, p, color }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm font-ibm" style={{ color: "hsl(var(--ink))" }}>
                    {label}
                  </span>
                  <span className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>
                    {value} чел. · {p}%
                  </span>
                </div>
                <div className="h-2 w-full" style={{ background: "hsl(var(--muted))" }}>
                  <div
                    className="h-2 transition-all duration-700"
                    style={{ width: `${p}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-12 archive-border">
          <Icon
            name="BarChart2"
            size={36}
            style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 12px" }}
          />
          <p className="font-cormorant text-xl" style={{ color: "hsl(var(--ink-light))" }}>
            Нет данных
          </p>
          <p className="text-sm font-ibm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Добавьте записи для отображения статистики
          </p>
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [page, setPage] = useState("home");
  const { people, loading, error, addPerson, editPerson, deletePerson } = usePersonsApi();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [saving, setSaving] = useState(false);
  const authorName = "Пользователь";

  function navTo(p: string) {
    setEditingPerson(null);
    setSelectedPerson(null);
    setPage(p);
  }

  async function handleAdd(data: FormData) {
    setSaving(true);
    const result = await addPerson(data, authorName);
    setSaving(false);
    if (result) setPage("home");
  }

  async function handleEdit(data: FormData) {
    if (!editingPerson) return;
    setSaving(true);
    const updated = await editPerson(editingPerson, data, authorName);
    setSaving(false);
    if (updated) {
      setEditingPerson(null);
      setSelectedPerson(updated);
    }
  }

  async function handleDelete(id: string) {
    await deletePerson(id);
    setSelectedPerson(null);
  }

  const currentPage = editingPerson ? "add" : page;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <AppHeader page={currentPage} onNav={navTo} total={people.length} />

      {error && (
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="border px-4 py-2 text-sm font-ibm flex items-center gap-2"
            style={{ borderColor: "hsl(var(--destructive))", color: "hsl(var(--destructive))", background: "hsl(var(--destructive) / 0.06)" }}>
            <Icon name="AlertCircle" size={14} />
            {error}
          </div>
        </div>
      )}

      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "hsl(var(--aged-border))", borderTopColor: "hsl(var(--ink))" }} />
            <p className="font-cormorant text-lg" style={{ color: "hsl(var(--ink-light))" }}>
              Загрузка архива...
            </p>
          </div>
        ) : editingPerson ? (
          <FormPage
            title="Редактировать запись"
            subtitle="Правка дела"
            initial={editingPerson}
            onSave={handleEdit}
            onCancel={() => setEditingPerson(null)}
            saving={saving}
          />
        ) : page === "home" ? (
          <HomePage people={people} onView={setSelectedPerson} onAdd={() => setPage("add")} />
        ) : page === "add" ? (
          <FormPage
            title="Добавить запись"
            subtitle="Новое дело"
            onSave={handleAdd}
            onCancel={() => setPage("home")}
            saving={saving}
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
          onEdit={() => {
            setEditingPerson(selectedPerson);
            setSelectedPerson(null);
          }}
          onDelete={() => handleDelete(selectedPerson.id)}
        />
      )}
    </div>
  );
}