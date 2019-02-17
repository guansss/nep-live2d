import path from 'path';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';

import loadEnv from './load-env';
import generateProjectJson from './project-json-generator';

/** @type {ENV} */
const env = loadEnv();

if (!env)
    throw 'Missing environment variables';

const rl = readline.createInterface(process.stdin, process.stdout);

(async function setup() {
    console.log(chalk.black.bgBlue(' SETUP '));

    try {
        console.log(chalk.blue('Making files in', env.WALLPAPER_PATH));

        await copyFiles(
            ['./assets/stub.html', path.join(env.WALLPAPER_PATH, 'index.html')],
            ['./assets/preview.jpg', path.join(env.WALLPAPER_PATH, 'preview.jpg')]
        );

        await setupProjectJson();
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

    await Promise.all(filePairs.map(([from, to]) => copyFile(from, to)));
}

async function setupProjectJson() {
    const projectJsonPath = path.join(env.WALLPAPER_PATH, 'project.json');

    if (fs.existsSync(projectJsonPath)) {
        console.log(chalk.red(projectJsonPath));
        await confirm('File already exists, overwrite it?');
    }

    generateProjectJson(projectJsonPath);
    console.log(chalk.green(projectJsonPath));
}

async function confirm(message) {
    const result = await new Promise(resolve => rl.question(message + ' [y]/n: ', resolve));

    if (result !== 'y')
        throw 'Action canceled';
}
