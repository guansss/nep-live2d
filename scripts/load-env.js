/**
 * @typedef {Object} ENV
 * @property {string} WALLPAPER_PATH - Path to the wallpaper directory
 */

import chalk from 'chalk';
import fs from 'fs';
import vue$loadEnv from '@vue/cli-service/lib/util/loadEnv';

const ENV_VARS = {
    WALLPAPER_PATH(v) {
        if (!fs.lstatSync(v).isDirectory()) throw 'Path is not a directory';
    }
};

function loadEnv() {
    const env = vue$loadEnv('.env.local');
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
        console.log(
            chalk.bgRed.black(' CHECK ENV FAILED '),
            'Pleas check your',
            chalk.bold('.env.local'),
            'file'
        );
    } else {
        console.log(chalk.bgGreen.black(' CHECK ENV PASSED '));
        return env;
    }
}

module.exports = loadEnv;
