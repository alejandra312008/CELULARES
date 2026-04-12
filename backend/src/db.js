import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "..", "data", "celulares.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  reset_token TEXT,
  reset_expires INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS celulares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  marca TEXT,
  email TEXT,
  pulgadas REAL,
  megapx INTEGER,
  ram INTEGER,
  almacenamientoPpal INTEGER,
  almacenamientoSecun INTEGER,
  sistemaOperativo TEXT,
  operador TEXT,
  tecnologiaDeBanda TEXT,
  wifi INTEGER NOT NULL DEFAULT 0,
  bluetooth INTEGER NOT NULL DEFAULT 0,
  camaras INTEGER,
  marcaCpu TEXT,
  velocidadCpu REAL,
  nfc INTEGER NOT NULL DEFAULT 0,
  huella INTEGER NOT NULL DEFAULT 0,
  ir INTEGER NOT NULL DEFAULT 0,
  resteAgua INTEGER NOT NULL DEFAULT 0,
  cantidadSim INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_celulares_marca ON celulares(marca);
CREATE INDEX IF NOT EXISTS idx_celulares_so ON celulares(sistemaOperativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
`);

const cols = db.prepare("PRAGMA table_info(usuarios)").all();
const colNames = new Set(cols.map((c) => c.name));
if (cols.length > 0 && !colNames.has("username")) {
  db.exec("ALTER TABLE usuarios ADD COLUMN username TEXT");
  db.prepare("UPDATE usuarios SET username = email WHERE username IS NULL OR trim(username) = ''").run();
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_username ON usuarios(username)");
}

export default db;
