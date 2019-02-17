const path = require('path');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const loadEnv = require('./load-env');

/** @type {ENV} */
const env = loadEnv();

if (env) {
    setup();
}

async function setup() {
    console.log(chalk.black.bgBlue(' SETUP '));

    try {
        console.log(chalk.blue('Copying files to', env.WALLPAPER_PATH));
        await copyFiles(['./assets/stub.html', path.join(env.WALLPAPER_PATH, 'index.html')]);
    } catch (e) {
        console.warn(e);
    }
}

async function copyFiles(...filePairs) {
    const rl = readline.createInterface(process.stdin, process.stdout);

    async function copyFile(from, to) {
        if (fs.existsSync(to)) {
            console.log(chalk.red(to));

            const result = await new Promise(resolve =>
                rl.question('File already exists, overwrite it? [y]/n: ', resolve));

            if (result !== 'y')
                throw 'Aborted by user';
        }

        fs.copyFileSync(from, to);
        console.log(chalk.green(to));
    }

    await Promise.all(filePairs.map(([from, to]) => copyFile(from, to)))
        .finally(() => rl.close());
}