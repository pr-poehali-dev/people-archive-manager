
CREATE TABLE IF NOT EXISTS t_p27423140_people_archive_manag.persons (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date TEXT NOT NULL DEFAULT '',
  death_date TEXT NOT NULL DEFAULT '',
  birth_place TEXT NOT NULL DEFAULT '',
  awards TEXT NOT NULL DEFAULT '',
  biography TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'alive',
  photo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS t_p27423140_people_archive_manag.history (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL,
  action_date TEXT NOT NULL,
  author TEXT NOT NULL,
  action TEXT NOT NULL,
  changes TEXT NOT NULL
);
