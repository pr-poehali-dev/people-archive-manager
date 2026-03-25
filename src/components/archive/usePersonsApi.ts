import { useState, useEffect } from "react";
import { type Person, type FormData, type Status, STATUS_LABELS } from "./types";

const API_URL = "https://functions.poehali.dev/fc8a4b58-b9f1-4907-9b21-d4d86d14e285";

/** Преобразует snake_case ответ сервера в Person */
function mapPerson(raw: Record<string, unknown>): Person {
  return {
    id: String(raw.id),
    fullName: (raw.full_name as string) || "",
    birthDate: (raw.birth_date as string) || "",
    deathDate: (raw.death_date as string) || "",
    birthPlace: (raw.birth_place as string) || "",
    awards: (raw.awards as string) || "",
    biography: (raw.biography as string) || "",
    status: (raw.status as Status) || "alive",
    photo: (raw.photo as string) || "",
    createdAt: (raw.created_at as string) || "",
    history: (raw.history as Person["history"]) || [],
  };
}

export function usePersonsApi() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Фильтруем мягко удалённых
      const filtered = (data as Record<string, unknown>[])
        .filter((p) => p.status !== "deleted")
        .map(mapPerson);
      setPeople(filtered);
    } catch {
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addPerson(data: FormData, authorName: string): Promise<Person | null> {
    const now = new Date().toISOString().split("T")[0];
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, createdAt: now, author: authorName }),
    });
    const json = await res.json();
    if (!res.ok) return null;
    const newPerson: Person = {
      ...data,
      id: String(json.id),
      createdAt: now,
      history: [{ date: now, author: authorName, action: "Создание записи", changes: "Первичная запись внесена в архив" }],
    };
    setPeople((p) => [newPerson, ...p]);
    return newPerson;
  }

  async function editPerson(editingPerson: Person, data: FormData, authorName: string): Promise<Person | null> {
    const now = new Date().toISOString().split("T")[0];
    const changes: string[] = [];
    if (data.fullName !== editingPerson.fullName)
      changes.push(`ФИО: «${editingPerson.fullName}» → «${data.fullName}»`);
    if (data.status !== editingPerson.status)
      changes.push(`Статус: ${STATUS_LABELS[editingPerson.status]} → ${STATUS_LABELS[data.status as Status]}`);
    if (data.birthDate !== editingPerson.birthDate) changes.push("Дата рождения изменена");
    if (data.deathDate !== editingPerson.deathDate) changes.push("Дата смерти изменена");
    if (data.birthPlace !== editingPerson.birthPlace) changes.push("Место рождения изменено");
    if (data.awards !== editingPerson.awards) changes.push("Сведения о наградах обновлены");
    if (data.biography !== editingPerson.biography) changes.push("Биография обновлена");
    if (data.photo !== editingPerson.photo) changes.push("Фотография обновлена");

    const histEntry = {
      date: now,
      author: authorName,
      action: "Редактирование",
      changes: changes.length ? changes.join("; ") : "Незначительные правки",
    };

    const res = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingPerson.id, ...data, historyEntries: [histEntry] }),
    });
    if (!res.ok) return null;

    const updated: Person = {
      ...editingPerson,
      ...data,
      status: data.status as Status,
      history: [...editingPerson.history, histEntry],
    };
    setPeople((p) => p.map((x) => (x.id === updated.id ? updated : x)));
    return updated;
  }

  async function deletePerson(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) return false;
    setPeople((p) => p.filter((x) => x.id !== id));
    return true;
  }

  return { people, loading, error, addPerson, editPerson, deletePerson };
}
