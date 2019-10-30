const path = require('path');
const merge = require('lodash/merge');
const { readLocales } = require('./scripts/project-json-generator');

module.exports = {
    productionSourceMap: false,
    publicPath: '', // use empty to make generated files be able to load by 'file://' scheme

    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false,

        // see https://webpack.js.org/configuration/dev-server/#devserverbefore
        before(app) {
            // handle the transfer of Wallpaper Engine properties
            // see "/assets/bridge.html"

            // I MUST BE CRAZY TO DO THIS

            const props = {
                userProps: {},
                generalProps: {},
                files: {},
            };

            // receive properties by POST
            app.post('/props', require('body-parser').json(), (req, res, next) => {
                // save props to local variables
                merge(props.userProps, req.body.userProps);
                merge(props.generalProps, req.body.generalProps);

                // DON'T use merge on files because merging will keep the removed files!
                Object.assign(props.files, req.body.files);

                res.json(props);
            });

            // return properties by GET
            app.get('/props', (req, res, next) => {
                res.json(props);
            });
        },

        after(app) {
            // override default 404 behaviour so it won't send us an HTML 404 page
            app.use((req, res, next) => {
                res.status(404).end();
            });
        },
    },

    chainWebpack(config) {
        // embed the version number in package.json
        // see https://github.com/webpack/webpack/issues/237
        // and https://stackoverflow.com/questions/53076540/vue-js-webpack-problem-cant-add-plugin-to-vue-config-js-with-configurewebpack
        config.plugin('define').tap(args => {
            args[0]['process.env'].VERSION = JSON.stringify(process.env.npm_package_version);
            args[0]['process.env'].I18N = JSON.stringify(readLocales());
            return args;
        });

        // load SVGs
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    },
};
