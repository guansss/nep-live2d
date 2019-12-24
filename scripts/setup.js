import path from 'path';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';

import loadEnv from './load-env';
import { generate as generateProjectJSON } from './project-json-generator';

const env = loadEnv();

if (!env) {
    console.error('Missing environment variables');
    process.exit(1);
}

const OVERWRITE_MESSAGE = 'File already exists, overwrite it?';

const rl = readline.createInterface(process.stdin, process.stdout);

(async function setup() {
    console.log(chalk.black.bgBlue(' SETUP '));

    try {
        console.log(chalk.blue('Making files in', env.WALLPAPER_PATH));

        await copyFiles(
            ['./assets/bridge.html', path.join(env.WALLPAPER_PATH, 'index.html')],
            ['./assets/preview.jpg', path.join(env.WALLPAPER_PATH, 'preview.jpg')],
        );

        await setupProjectJSON();
    } catch (e) {
        console.warn(e);
    }

    rl.close();
})();

async function copyFiles(...filePairs) {
    async function copyFile(from, to) {
        if (await checkConflict(to, from)) {
            fs.copyFileSync(from, to);
            console.log(chalk.black.bgGreen(' WRITE '), chalk.green(to));
        }
    }

    for (const [from, to] of filePairs) {
        await copyFile(from, to);
    }
}

async function setupProjectJSON() {
    const projectJSON = generateProjectJSON(true);

    for (const jsonPath of [
        path.join(env.WALLPAPER_PATH, 'project.json'),
        path.join(__dirname, '../wallpaper/project.json'),
    ]) {
        if (await checkConflictByContent(jsonPath, projectJSON)) {
            fs.writeFileSync(jsonPath, projectJSON);
            console.log(chalk.black.bgGreen(' WRITE '), chalk.green(jsonPath));
        }
    }
}

/**
 * @return {Promise<boolean>} True if dst should be overwritten.
 */
async function checkConflict(dst, src) {
    if (fs.existsSync(dst)) {
        if (!fs.readFileSync(dst).equals(fs.readFileSync(src))) {
            console.log(chalk.black.bgRed(' CONFLICT '), chalk.red(dst));
            await confirm(OVERWRITE_MESSAGE);
            return true;
        }

        console.log(chalk.black.bgGreen(' SKIP '), chalk.green(dst));
        return false;
    }
    return true;
}

/**
 * @return {Promise<boolean>} True if dst should be overwritten.
 */
async function checkConflictByContent(dst, content) {
    if (fs.existsSync(dst)) {
        if (fs.readFileSync(dst, 'utf-8') !== content) {
            console.log(chalk.black.bgRed(' CONFLICT '), chalk.red(dst));
            await confirm(OVERWRITE_MESSAGE);
            return true;
        }

        console.log(chalk.black.bgGreen(' SKIP '), chalk.green(dst));
        return false;
    }
    return true;
}

async function confirm(message) {
    const result = await new Promise(resolve => rl.question(message + ' y/[n]: ', resolve));

    if (result !== 'y') throw 'Action canceled';
}
