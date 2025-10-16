import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chalk from "chalk";
import tripsRouter from "./routes/trips.js";
import { getDatabase } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
	console.log(chalk.gray(`${req.method} ${req.path}`));
	next();
});

getDatabase();

app.use("/api", tripsRouter);

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
	res.status(404).json({ error: "Not found", path: req.path });
});

app.use((err, req, res, next) => {
	console.error(chalk.red("Error:"), err);
	res.status(err.status || 500).json({
		error: err.message || "Internal server error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

app.listen(PORT, () => {
	console.log(chalk.green(`\nServer running on http://localhost:${PORT}`));
	console.log(chalk.cyan(`API endpoints available at http://localhost:${PORT}/api`));
	console.log(chalk.gray(`Environment: ${process.env.NODE_ENV || "development"}\n`));
});

process.on("SIGTERM", () => {
	console.log(chalk.yellow("\n=K Shutting down gracefully..."));
	process.exit(0);
});
