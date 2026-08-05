const fs = require('fs');
const path = require('path');

// In-memory high performance store with disk backup fallback
let db = {
  users: [],
  employees: [],
  projects: [],
  seats: [],
  floors: [],
  zones: [],
  announcements: [],
  activities: []
};

const DATA_FILE = path.join(__dirname, 'db_data.json');

const loadFromDisk = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      db = JSON.parse(raw);
      console.log(`[DataStore] Loaded ${db.employees.length} employees, ${db.seats.length} seats from persistent storage.`);
      return true;
    }
  } catch (err) {
    console.error('[DataStore] Error loading data file:', err);
  }
  return false;
};

const saveToDisk = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[DataStore] Error saving data file:', err);
  }
};

module.exports = {
  db,
  loadFromDisk,
  saveToDisk
};
