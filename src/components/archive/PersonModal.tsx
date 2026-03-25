import { useState } from "react";
import Icon from "@/components/ui/icon";
import { type Person, STATUS_LABELS, formatDate, getAge } from "./types";
import { StatusBadge } from "./PersonCard";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-ibm uppercase tracking-widest mb-0.5" style={{ color: "hsl(var(--ink-light))" }}>
        {label}
      </p>
      <p className="font-ibm text-sm" style={{ color: "hsl(var(--ink))" }}>
        {value}
      </p>
    </div>
  );
}

export function PersonModal({
  person,
  onClose,
  onEdit,
  onDelete,
}: {
  person: Person;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<"info" | "history">("info");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "hsl(var(--ink) / 0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{ background: "hsl(var(--parchment))", border: "1px solid hsl(var(--aged-border))" }}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: "hsl(var(--aged-border))" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.fullName}
                  className="w-16 h-20 object-cover border flex-shrink-0"
                  style={{ borderColor: "hsl(var(--aged-border))" }}
                />
              ) : (
                <div
                  className="w-16 h-20 flex items-center justify-center border flex-shrink-0"
                  style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}
                >
                  <Icon name="User" size={28} style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              )}
              <div>
                <p
                  className="text-xs font-ibm tracking-widest uppercase mb-1"
                  style={{ color: "hsl(var(--ink-light))" }}
                >
                  Дело № {person.id.padStart(4, "0")}
                </p>
                <h2
                  className="font-cormorant font-semibold text-2xl leading-tight"
                  style={{ color: "hsl(var(--ink))" }}
                >
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
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-ibm transition-colors ${
                tab === t ? "border-b-2 font-medium" : "opacity-50"
              }`}
              style={{ borderColor: tab === t ? "hsl(var(--ink))" : "transparent", color: "hsl(var(--ink))" }}
            >
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
              <InfoRow label="Дата смерти" value={person.deathDate ? formatDate(person.deathDate) : "—"} />
              {person.birthDate && (
                <InfoRow
                  label={person.deathDate ? "Прожил лет" : "Возраст"}
                  value={`${getAge(person.birthDate, person.deathDate)} лет`}
                />
              )}
              <InfoRow label="Место рождения" value={person.birthPlace || "—"} />
              <InfoRow label="Статус" value={STATUS_LABELS[person.status]} />
              <div>
                <p
                  className="text-xs font-ibm uppercase tracking-widest mb-1.5"
                  style={{ color: "hsl(var(--ink-light))" }}
                >
                  Награды
                </p>
                {person.awards ? (
                  <div className="space-y-1">
                    {person.awards
                      .split("\n")
                      .filter(Boolean)
                      .map((a, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-base leading-5">✦</span>
                          <p className="font-ibm text-sm" style={{ color: "hsl(var(--ink))" }}>
                            {a}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="font-ibm text-sm italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Нет сведений
                  </p>
                )}
              </div>
              <div>
                <p
                  className="text-xs font-ibm uppercase tracking-widest mb-1.5"
                  style={{ color: "hsl(var(--ink-light))" }}
                >
                  Биография
                </p>
                {person.biography ? (
                  <p
                    className="font-ibm text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "hsl(var(--ink))" }}
                  >
                    {person.biography}
                  </p>
                ) : (
                  <p className="font-ibm text-sm italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Биография не указана
                  </p>
                )}
              </div>
              <InfoRow
                label="Дата внесения в архив"
                value={person.createdAt ? formatDate(person.createdAt) : "—"}
              />
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {person.history.length === 0 ? (
                <p
                  className="text-sm font-ibm italic text-center py-4"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  История изменений пуста
                </p>
              ) : (
                [...person.history].reverse().map((h, i) => (
                  <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: "hsl(var(--aged-border))" }}>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-ibm font-medium" style={{ color: "hsl(var(--ink))" }}>
                        {h.action}
                      </span>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {formatDate(h.date)}
                      </span>
                    </div>
                    <p className="text-xs font-ibm" style={{ color: "hsl(var(--ink-light))" }}>
                      {h.changes}
                    </p>
                    <p className="text-xs mt-0.5 font-ibm italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                      — {h.author}
                    </p>
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
              <button
                onClick={onDelete}
                className="px-3 py-2 text-sm font-ibm"
                style={{ background: "hsl(var(--destructive))", color: "white" }}
              >
                Да, удалить
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 text-sm font-ibm border"
                style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}
              >
                Отмена
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="flex-1 py-2 text-sm font-ibm border flex items-center justify-center gap-1.5 transition-colors hover:bg-secondary"
                style={{ borderColor: "hsl(var(--aged-border))", color: "hsl(var(--ink))" }}
              >
                <Icon name="Pencil" size={14} />
                Редактировать
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="py-2 px-4 text-sm font-ibm border flex items-center justify-center gap-1.5 transition-colors hover:bg-red-50"
                style={{ borderColor: "hsl(var(--destructive) / 0.5)", color: "hsl(var(--destructive))" }}
              >
                <Icon name="Trash2" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}