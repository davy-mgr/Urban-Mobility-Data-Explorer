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
	db = new Database(dbPath, { verbose: console.log });

	// Enable WAL mode for better concurrency
	db.pragma("journal_mode = WAL");

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
