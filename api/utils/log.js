import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE_PATH = path.join(__dirname, "../log.json");

function getLogJSON() {
    try {
        const rawFile = fs.readFileSync(LOG_FILE_PATH);
        const fileInJSONFormat = JSON.parse(rawFile);
        return fileInJSONFormat;
    } catch (error) {
        throw error
    }
};

function updateLog() {
    try {
        const log = getLogJSON();
        log.lastCalled = Date.now();

        const stringifiedObject = JSON.stringify(log, null, 2);
        fs.writeFileSync(LOG_FILE_PATH, stringifiedObject);
    } catch (error) {
        throw error;
    }
};

export {
    getLogJSON,
    updateLog
}