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
	const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");

	// Ensure data directory exists
	fs.ensureDirSync(path.dirname(dbPath));

	// Initialize database connection
	db = new Database(dbPath);

	// Enable WAL mode for better concurrency
	db.pragma("journal_mode = WAL");

	// Performance optimizations
	db.pragma("synchronous = NORMAL"); // Faster writes, still safe with WAL
	db.pragma("cache_size = -64000"); // 64MB cache (negative = KB)
	db.pragma("temp_store = MEMORY"); // Store temp tables in memory
	db.pragma("mmap_size = 30000000000"); // 30GB memory-mapped I/O
	db.pragma("page_size = 4096"); // Optimal page size

	// Analyze database for query optimization (run on startup)
	db.pragma("optimize");

	// Initialize schema if not exists
	if (fs.existsSync(schemaPath)) {
		const schema = fs.readFileSync(schemaPath, "utf-8");
		db.exec(schema);
		console.log(" Database schema initialized");
	}

	return db;
}

export function closeDatabase() {
	if (db) {
		db.close();
		db = null;
	}
}

// Graceful shutdown
process.on("SIGINT", () => {
	closeDatabase();
	process.exit(0);
});

export default { getDatabase, closeDatabase };
