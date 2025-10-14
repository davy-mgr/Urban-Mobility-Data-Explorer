import path from "path";
import { cleanData } from "../src/processing/cleanData.js";

const INPUT = path.resolve("src/data/raw/train.csv");
const OUTPUT = path.resolve("src/data/processed/cleaned_trips.csv");

(async () => {
	  const result = await cleanData(INPUT, OUTPUT);
	  console.log("Summary:", result);
})();

