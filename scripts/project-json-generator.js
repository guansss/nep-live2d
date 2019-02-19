import fs from 'fs';

function generate(outputPath) {
    const project = require('../assets/project-json/base.json');

    fs.readdirSync('assets/project-json/locales').forEach(file => {
        const locale = file.slice(0, file.indexOf('.json'));
        const content = require('../assets/project-json/locales/' + file);

        project.general.localization[locale] = content;
    });

    fs.writeFileSync(outputPath, JSON.stringify(project));
}

module.exports = generate;
