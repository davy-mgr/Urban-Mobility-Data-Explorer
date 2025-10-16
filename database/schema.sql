import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export function getDatabase() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || path.resolve(__dirname, "../../data/trips.db");
  const schemaPath = path.resolve(process.cwd(), "database/schema.sql");

  fs.ensureDirSync(path.dirname(dbPath));

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("cache_size = -64000");
  db.pragma("temp_store = MEMORY");
  db.pragma("mmap_size = 30000000000");
  db.pragma("page_size = 4096");
  db.pragma("optimize");

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schema);
    console.log("✅ Database schema initialized from:", schemaPath);
  } else {
    console.warn("⚠️  Schema file not found:", schemaPath);
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

export default { getDatabase, closeDatabase };
