/**
 * @typedef {Object} ENV
 * @property {string} WALLPAPER_PATH - Path to the wallpaper directory
 * @property {string} WORKSHOP_ID - Workshop ID
 */

const chalk = require('chalk');
const fs = require('fs');
const dotenv = require('dotenv');

const ENV_FILE = '.env.local';

const ENV_VARS = {
    WALLPAPER_PATH(v) {
        if (!fs.lstatSync(v).isDirectory()) throw 'Path is not a directory';
    },
    WORKSHOP_ID(v) {},
};

/**
 * @return {ENV}
 */
function loadEnv() {
    if (!fs.existsSync(ENV_FILE)) {
        console.error(`Cannot find env file "${ENV_FILE}"`);
        return;
    }

    const env = dotenv.config({ path: ENV_FILE, debug: true }).parsed;
    let checkPassed = true;

    Object.entries(ENV_VARS).forEach(([key, validator]) => {
        const value = env[key];

        let message = `[${key}=${value || ''}] `;

        if (!value) {
            checkPassed = false;
            message += '?';
        } else {
            try {
                validator(value);
            } catch (e) {
                checkPassed = false;
                message += e;
            }
        }

        console.log(chalk[checkPassed ? 'green' : 'red'](message));
    });

    if (!checkPassed) {
        console.log(chalk.bgRed.black(' CHECK ENV FAILED '), 'Pleas check your', chalk.bold('.env.local'), 'file');
    } else {
        console.log(chalk.bgGreen.black(' CHECK ENV PASSED '));
        return env;
    }
}

module.exports = loadEnv;
