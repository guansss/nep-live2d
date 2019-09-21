import path from 'path';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';

import loadEnv from './load-env';
import generateProjectJSON from './project-json-generator';

/** @type {ENV} */
const env = loadEnv();

if (!env) {
    console.error('Missing environment variables');
    process.exit(1);
}

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
        if (fs.existsSync(to)) {
            console.log(chalk.red(to));
            await confirm('File already exists, overwrite it?');
        }

        fs.copyFileSync(from, to);
        console.log(chalk.green(to));
    }

    for (const [from, to] of filePairs) {
        await copyFile(from, to);
    }
}

async function setupProjectJSON() {
    const projectJSONPath = path.join(env.WALLPAPER_PATH, 'project.json');

    if (fs.existsSync(projectJSONPath)) {
        console.log(chalk.red(projectJSONPath));
        await confirm('File already exists, overwrite it?');
    }

    generateProjectJSON(projectJSONPath);
    console.log(chalk.green(projectJSONPath));
}

async function confirm(message) {
    const result = await new Promise(resolve =>
        rl.question(message + ' [y]/n: ', resolve),
    );

    if (result !== 'y') throw 'Action canceled';
}
