import fs from 'fs';

function generate(devMode) {
    const project = require('../assets/project-json/base.json');

    fs.readdirSync('assets/project-json/locales').forEach(file => {
        const locale = file.slice(0, file.indexOf('.json'));
        const content = require('../assets/project-json/locales/' + file);

        project.general.localization[locale] = content;

        if (devMode) {
            project.title = '[DEV] ' + project.title;
        }
    });

    return JSON.stringify(project);
}

module.exports = generate;
