import express from "express";
import * as Trip from "../models/Trip.js";
import { loadDataToDatabase } from "../services/dataLoader.js";
import path from "path";

const router = express.Router();

/**
 * DELETE /api/data/clear
 * Clear all data from the database
 */
router.delete("/data/clear", (req, res, next) => {
	try {
		const deletedCount = Trip.deleteAll();
		console.log(`🗑️  Cleared ${deletedCount} records from database`);

		res.json({
			success: true,
			message: "Database cleared successfully",
			deletedCount,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * POST /api/data/load
 * Trigger data cleaning and loading into database
 */
router.post("/data/load", async (req, res, next) => {
	try {
		const inputPath = process.env.DATA_RAW_PATH || path.resolve("src/data/raw/train.csv");

		console.log("Starting data load process...");
		const result = await loadDataToDatabase(inputPath);

		res.json({
			success: true,
			message: "Data loaded successfully",
			stats: result,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/trips
 * List trips with pagination, filtering, and sorting
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 100, max: 1000)
 *   - sortBy (default: pickup_datetime)
 *   - sortOrder (ASC/DESC, default: DESC)
 *   - minDuration, maxDuration (seconds)
 *   - minDistance, maxDistance (km)
 *   - pickupHour (0-23)
 *   - minPassengers
 *   - startDate, endDate (ISO format)
 */
router.get("/trips", (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
		const sortBy = req.query.sortBy || "pickup_datetime";
		const sortOrder = req.query.sortOrder || "DESC";

		const filters = {
			minDuration: req.query.minDuration,
			maxDuration: req.query.maxDuration,
			minDistance: req.query.minDistance,
			maxDistance: req.query.maxDistance,
			pickupHour: req.query.pickupHour,
			minPassengers: req.query.minPassengers,
			passengerCount: req.query.passengerCount,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
		};

		// Remove undefined filters
		Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

		const trips = Trip.findAll({ filters, page, limit, sortBy, sortOrder });
		const total = Trip.count(filters);

		res.json({
			data: trips,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
			filters,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/trips/:id
 * Get single trip by ID
 */
router.get("/trips/:id", (req, res, next) => {
	try {
		const trip = Trip.findById(req.params.id);

		if (!trip) {
			return res.status(404).json({ error: "Trip not found" });
		}

		res.json({ data: trip });
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/stats
 * Get aggregate statistics
 * Supports same filters as /api/trips
 */
router.get("/stats", (req, res, next) => {
	try {
		const filters = {
			minDuration: req.query.minDuration,
			maxDuration: req.query.maxDuration,
			minDistance: req.query.minDistance,
			maxDistance: req.query.maxDistance,
			pickupHour: req.query.pickupHour,
			minPassengers: req.query.minPassengers,
			passengerCount: req.query.passengerCount,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
		};

		// Remove undefined filters
		Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

		const stats = Trip.getStats(filters);
		const hourlyDistribution = Trip.getHourlyDistribution(filters);

		res.json({
			stats,
			hourlyDistribution,
			filters,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/stats/duration-distribution
 * Get trip duration histogram
 * Query params: bucketSize (default: 300 seconds = 5 minutes)
 * Supports same filters as /api/trips
 */
router.get("/stats/duration-distribution", (req, res, next) => {
	try {
		const filters = {
			minDuration: req.query.minDuration,
			maxDuration: req.query.maxDuration,
			minDistance: req.query.minDistance,
			maxDistance: req.query.maxDistance,
			pickupHour: req.query.pickupHour,
			minPassengers: req.query.minPassengers,
			passengerCount: req.query.passengerCount,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
		};

		// Remove undefined filters
		Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

		const bucketSize = parseInt(req.query.bucketSize) || 300;
		const distribution = Trip.getDurationDistribution(filters, bucketSize);

		res.json({
			distribution,
			bucketSize,
			filters,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/stats/distance-distribution
 * Get trip distance histogram
 * Query params: bucketSize (default: 2 km)
 * Supports same filters as /api/trips
 */
router.get("/stats/distance-distribution", (req, res, next) => {
	try {
		const filters = {
			minDuration: req.query.minDuration,
			maxDuration: req.query.maxDuration,
			minDistance: req.query.minDistance,
			maxDistance: req.query.maxDistance,
			pickupHour: req.query.pickupHour,
			minPassengers: req.query.minPassengers,
			passengerCount: req.query.passengerCount,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
		};

		// Remove undefined filters
		Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

		const bucketSize = parseFloat(req.query.bucketSize) || 2;
		const distribution = Trip.getDistanceDistribution(filters, bucketSize);

		res.json({
			distribution,
			bucketSize,
			filters,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * GET /api/stats/speed-distribution
 * Get average speed histogram
 * Query params: bucketSize (default: 5 km/h)
 * Supports same filters as /api/trips
 */
router.get("/stats/speed-distribution", (req, res, next) => {
	try {
		const filters = {
			minDuration: req.query.minDuration,
			maxDuration: req.query.maxDuration,
			minDistance: req.query.minDistance,
			maxDistance: req.query.maxDistance,
			pickupHour: req.query.pickupHour,
			minPassengers: req.query.minPassengers,
			passengerCount: req.query.passengerCount,
			startDate: req.query.startDate,
			endDate: req.query.endDate,
		};

		// Remove undefined filters
		Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

		const bucketSize = parseFloat(req.query.bucketSize) || 5;
		const distribution = Trip.getSpeedDistribution(filters, bucketSize);

		res.json({
			distribution,
			bucketSize,
			filters,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
