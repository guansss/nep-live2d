const fs = require('fs');
const pickBy = require('lodash/pickBy');

function generate(devMode) {
    const project = require('../assets/project.json');

    const locales = readLocales();

    // accept only the properties start with "ui_"
    Object.keys(locales).forEach(locale => {
        locales[locale] = pickBy(locales[locale], (value, key) => key.startsWith('ui_'));
    });

    project.general.localization = locales;

    if (process.env.npm_package_version.includes('beta')) {
        project.title = '[BETA] ' + project.title;
    }
    if (devMode) {
        project.title = '[DEV] ' + project.title;
    }

    return JSON.stringify(project);
}

function readLocales() {
    const locales = {};

    fs.readdirSync('assets/locales').forEach(file => {
        const locale = file.slice(0, file.indexOf('.json'));
        let content = fs.readFileSync('assets/locales/' + file, 'utf8');

        content = populate(content);
        locales[locale] = JSON.parse(content);
    });

    return locales;
}

function populate(text) {
    text = text.replace(/{VERSION}/g, process.env.npm_package_version);

    return text;
}

module.exports.generate = generate;
module.exports.readLocales = readLocales;
