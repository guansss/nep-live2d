import fs from 'fs';

function generate(devMode) {
    const project = require('../assets/project-json/base.json');

    fs.readdirSync('assets/project-json/locales').forEach(file => {
        const locale = file.slice(0, file.indexOf('.json'));
        let content = fs.readFileSync('assets/project-json/locales/' + file, 'utf8');

        content = content.replace('{VERSION}', process.env.npm_package_version);

        project.general.localization[locale] = JSON.parse(content);
    });

    if (process.env.npm_package_version.includes('beta')) {
        project.title = '[BETA] ' + project.title;
    }
    if (devMode) {
        project.title = '[DEV] ' + project.title;
    }

    return JSON.stringify(project);
}

module.exports = generate;
