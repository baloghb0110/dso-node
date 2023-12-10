const os = require('os');
const ProcessHandler = require('./ProcessHandler');
const Utilities = require('./Utilities');
const path = require('path');
const { commandArgs, getProcessDetailsAndUpdateArgs } = require('./config');

const originalConsoleLog = console.log;
console.log = (message, ...optionalParams) => {
    if (Utilities.isLogMessageAllowed(message)) {
        originalConsoleLog(message, ...optionalParams);
    }
};

const originalConsoleError = console.error;
console.error = (message, ...optionalParams) => {
    if (Utilities.isLogMessageAllowed(message)) {
        originalConsoleError(message, ...optionalParams);
    }
};

const workingDirectory = path.join(os.tmpdir(), 'DSOClient');

const homeDir = process.env.USERPROFILE || process.env.HOME;

if (!homeDir) {
    if (Utilities.isLogMessageAllowed('USERPROFILE or HOME environment variable not set.')) {
        console.error('USERPROFILE or HOME environment variable not set.');
    }
    process.exit(1);
}

const droClientPath = path.join(homeDir, 'AppData', 'Local', 'Temp', 'DSOClient', 'dlcache', 'dro_client64.exe');

getProcessDetailsAndUpdateArgs().then(() => {
    try {
        const processHandler = new ProcessHandler(droClientPath, commandArgs);
        processHandler.spawnProcess(workingDirectory);
    } catch (error) {
        if (Utilities.isLogMessageAllowed(error.message)) {
            console.error(`Hiba történt a folyamat indításakor: ${error.message}`);
        }
    }
}).catch(error => {
    if (Utilities.isLogMessageAllowed(error.message)) {
        console.error(`Hiba történt a folyamat adatainak frissítésekor: ${error.message}`);
    }
});
