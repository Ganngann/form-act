const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'persistence.log');
const INTERVAL_MS = 60000; // 1 minute

console.log(`Starting persistence check. Logging to ${LOG_FILE}`);
fs.writeFileSync(LOG_FILE, `Started at ${new Date().toISOString()}\n`);

let counter = 0;

setInterval(() => {
    counter++;
    const message = `Check ${counter} at ${new Date().toISOString()}\n`;
    console.log(message.trim());
    fs.appendFileSync(LOG_FILE, message);
}, INTERVAL_MS);

// Keep process alive
process.stdin.resume();
