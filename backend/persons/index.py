"""
API для работы с архивом людей.
Поддерживает GET (список), POST (создание), PUT (редактирование), DELETE (удаление).
"""
import json
import os
import psycopg2

SCHEMA = "t_p27423140_people_archive_manag"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    # GET — список всех записей с историей
    if method == "GET":
        cur.execute(f"""
            SELECT id, full_name, birth_date, death_date, birth_place,
                   awards, biography, status, photo, created_at
            FROM {SCHEMA}.persons
            ORDER BY id ASC
        """)
        rows = cur.fetchall()
        cols = ["id","full_name","birth_date","death_date","birth_place","awards","biography","status","photo","created_at"]
        people = []
        for row in rows:
            p = dict(zip(cols, row))
            cur.execute(f"""
                SELECT action_date, author, action, changes
                FROM {SCHEMA}.history
                WHERE person_id = %s
                ORDER BY id ASC
            """, (p["id"],))
            p["history"] = [
                {"date": h[0], "author": h[1], "action": h[2], "changes": h[3]}
                for h in cur.fetchall()
            ]
            p["id"] = str(p["id"])
            people.append(p)
        cur.close()
        conn.close()
        return resp(200, people)

    # POST — создание записи
    if method == "POST":
        now = body.get("createdAt", "")
        author = body.get("author", "Пользователь")
        cur.execute(f"""
            INSERT INTO {SCHEMA}.persons
              (full_name, birth_date, death_date, birth_place, awards, biography, status, photo, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            body.get("fullName", ""),
            body.get("birthDate", ""),
            body.get("deathDate", ""),
            body.get("birthPlace", ""),
            body.get("awards", ""),
            body.get("biography", ""),
            body.get("status", "alive"),
            body.get("photo", ""),
            now,
        ))
        new_id = cur.fetchone()[0]
        cur.execute(f"""
            INSERT INTO {SCHEMA}.history (person_id, action_date, author, action, changes)
            VALUES (%s, %s, %s, %s, %s)
        """, (new_id, now, author, "Создание записи", "Первичная запись внесена в архив"))
        conn.commit()
        cur.close()
        conn.close()
        return resp(201, {"id": str(new_id)})

    # PUT — редактирование записи
    if method == "PUT":
        person_id = body.get("id")
        if not person_id:
            return resp(400, {"error": "id required"})
        cur.execute(f"""
            UPDATE {SCHEMA}.persons SET
              full_name = %s, birth_date = %s, death_date = %s, birth_place = %s,
              awards = %s, biography = %s, status = %s, photo = %s
            WHERE id = %s
        """, (
            body.get("fullName", ""),
            body.get("birthDate", ""),
            body.get("deathDate", ""),
            body.get("birthPlace", ""),
            body.get("awards", ""),
            body.get("biography", ""),
            body.get("status", "alive"),
            body.get("photo", ""),
            int(person_id),
        ))
        # Записываем историю изменений
        for entry in body.get("historyEntries", []):
            cur.execute(f"""
                INSERT INTO {SCHEMA}.history (person_id, action_date, author, action, changes)
                VALUES (%s, %s, %s, %s, %s)
            """, (int(person_id), entry["date"], entry["author"], entry["action"], entry["changes"]))
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {"ok": True})

    # DELETE — мягкое удаление (помечаем статусом archived через отдельный флаг)
    # Платформа не поддерживает SQL DELETE, поэтому используем поле is_deleted
    if method == "DELETE":
        person_id = params.get("id") or body.get("id")
        if not person_id:
            return resp(400, {"error": "id required"})
        cur.execute(f"""
            UPDATE {SCHEMA}.persons SET status = 'deleted' WHERE id = %s
        """, (int(person_id),))
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {"ok": True})

    cur.close()
    conn.close()
    return resp(405, {"error": "Method not allowed"})
