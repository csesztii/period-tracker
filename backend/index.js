/**
 * @typedef {import("./types").Period} Period
 */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs-extra";

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = "./data/periods.json";

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
await fs.ensureFile(DATA_FILE);

try {
  const fileContent = await fs.readJson(DATA_FILE);
  periods = Array.isArray(fileContent) ? fileContent : [];
} catch {
  await fs.writeJson(DATA_FILE, []);
}

// Load existing periods
async function loadPeriods() {
  try {
    const data = await fs.readJson(DATA_FILE);
    return Array.isArray(data) ? data : [];
  } catch {
    await fs.writeJson(DATA_FILE, []);
    return [];
  }
}

/** @type {Period[]} */
let periods = await loadPeriods();

// Data validation
function validatePeriod(obj) {
  return (
    obj &&
    typeof obj.start === "string" &&
    typeof obj.end === "string" &&
    !isNaN(Date.parse(obj.start)) &&
    !isNaN(Date.parse(obj.end))
  );
}

// --- Routes ---

// Get all saved periods
app.get("/api/periods", (req, res) => {
  res.json(periods);
});

// Add a new period
app.post("/api/periods", async (req, res) => {
  const { start, end } = req.body;

  // Validate types
  if (!start || !end) {
    return res.status(400).json({ error: "Start and end dates required." });
  }

  if (!validatePeriod(req.body)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const newPeriod = {
    id: Date.now(),
    start,
    end,
  };

  periods.push(newPeriod);

  // Save to file
  await fs.writeJson(DATA_FILE, periods, { spaces: 2 });

  res.status(201).json(newPeriod);
});

// Delete a period
app.delete("/api/periods/:id", async (req, res) => {
  const id = Number(req.params.id);
  periods = periods.filter(p => p.id !== id);
  await fs.writeJson(DATA_FILE, periods, { spaces: 2 });
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
