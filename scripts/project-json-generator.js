const fs = require('fs');
const pickBy = require('lodash/pickBy');
const projectJSON = require('../assets/project.json');
const env = require('./load-env')();

function generate(devMode) {
    const locales = readLocales();

    // accept only the properties start with "ui_"
    Object.keys(locales).forEach(locale => {
        locales[locale] = pickBy(locales[locale], (value, key) => key.startsWith('ui_'));
    });

    projectJSON.general.localization = locales;

    if (process.env.npm_package_version.includes('beta')) {
        projectJSON.title = '[BETA] ' + projectJSON.title;
    }
    if (devMode) {
        projectJSON.title = '[DEV] ' + projectJSON.title;
    } else if (env.WORKSHOP_ID) {
        projectJSON['workshopid'] = env.WORKSHOP_ID;
    }

    return JSON.stringify(projectJSON);
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
    text = text.replace(/{NAME}/g, projectJSON.title);
    text = text.replace(/{VERSION}/g, process.env.npm_package_version);

    return text;
}

module.exports.generate = generate;
module.exports.readLocales = readLocales;
