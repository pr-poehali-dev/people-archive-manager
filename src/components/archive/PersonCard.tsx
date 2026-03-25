import Icon from "@/components/ui/icon";
import { type Person, type Status, STATUS_LABELS, formatDate } from "./types";

// --- Status Badge ---
export function StatusBadge({ status }: { status: Status }) {
  const cls = {
    alive: "text-emerald-700 border-emerald-600 bg-emerald-50",
    killed: "text-red-700 border-red-600 bg-red-50",
    missing: "text-amber-700 border-amber-600 bg-amber-50",
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-ibm uppercase tracking-widest ${cls}`}
      style={{ letterSpacing: "0.12em" }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// --- Person Card ---
export function PersonCard({ person, onClick }: { person: Person; onClick: () => void }) {
  const barColor =
    person.status === "alive"
      ? "hsl(140 35% 32%)"
      : person.status === "killed"
      ? "hsl(0 55% 42%)"
      : "hsl(42 60% 38%)";

  return (
    <div
      onClick={onClick}
      className="archive-border bg-card hover-card-lift cursor-pointer animate-slide-up p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: barColor }} />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-cormorant font-semibold text-lg leading-tight truncate"
              style={{ color: "hsl(var(--ink))" }}
            >
              {person.fullName}
            </h3>
            <p className="text-xs font-ibm mt-0.5" style={{ color: "hsl(var(--ink-light))" }}>
              {person.birthDate ? formatDate(person.birthDate) : "Дата неизвестна"}
            </p>
            {person.birthPlace && (
              <p className="text-xs font-ibm truncate" style={{ color: "hsl(var(--ink-light))" }}>
                {person.birthPlace}
              </p>
            )}
          </div>
          {person.photo ? (
            <img
              src={person.photo}
              alt={person.fullName}
              className="w-12 h-14 object-cover flex-shrink-0 border"
              style={{ borderColor: "hsl(var(--aged-border))" }}
            />
          ) : (
            <div
              className="w-12 h-14 flex-shrink-0 flex items-center justify-center border"
              style={{ borderColor: "hsl(var(--aged-border))", background: "hsl(var(--muted))" }}
            >
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
