import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chalk from "chalk";
import tripsRouter from "./routes/trips.js";
import { getDatabase } from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
	console.log(chalk.gray(`${req.method} ${req.path}`));
	next();
});

// Initialize database connection
getDatabase();

// Routes
app.use("/api", tripsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Not found", path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(chalk.red("Error:"), err);
	res.status(err.status || 500).json({
		error: err.message || "Internal server error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

// Start server
app.listen(PORT, () => {
	console.log(chalk.green(`\nServer running on http://localhost:${PORT}`));
	console.log(chalk.cyan(`API endpoints available at http://localhost:${PORT}/api`));
	console.log(chalk.gray(`Environment: ${process.env.NODE_ENV || "development"}\n`));
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log(chalk.yellow("\n=K Shutting down gracefully..."));
	process.exit(0);
});
