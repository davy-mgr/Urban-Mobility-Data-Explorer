import fs from "fs-extra";
import winston from "winston";
import path from "path";

const logsDir = path.join("src", "data", "logs");
fs.ensureDirSync(logsDir);

const logger = winston.createLogger({
	  level: "info",
	  format: winston.format.combine(
		      winston.format.timestamp(),
		      winston.format.printf(({ timestamp, level, message }) => {
			            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
			          })
		    ),
	  transports: [
		      new winston.transports.File({ filename: path.join(logsDir, "cleaning.log") }),
		      new winston.transports.Console(),
		    ],
});

export default logger;

