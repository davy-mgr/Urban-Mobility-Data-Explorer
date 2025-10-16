import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "path";

let db = null;

export function getDatabase() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || path.resolve("backend/src/data/trips.db");
  const schemaPath = path.resolve("database/schema.sql");

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
    throw new Error(`Schema file not found at ${schemaPath}`);
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
