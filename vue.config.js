const path = require('path');

module.exports = {
    productionSourceMap: false,
    devServer: {
        contentBase: path.resolve('wallpaper'),
        historyApiFallback: false,

        // see https://webpack.js.org/configuration/dev-server/#devserverbefore
        before(app) {
            // handle the transfer of Wallpaper Engine properties
            // see "/assets/bridge.html"

            // I MUST BE CRAZY TO DO THIS

            const props = {
                userProps: undefined,
                generalProps: undefined,
            };

            // receive properties by POST
            app.post('/props', require('body-parser').json(), (req, res, next) => {
                // save props to local variables
                props.userProps = req.body.userProps;
                props.generalProps = req.body.generalProps;

                res.json(props);
            });

            // return properties by GET
            app.get('/props', (req, res, next) => {
                res.json(props);
            });
        },
    },
    chainWebpack(config) {
        const svgRule = config.module.rule('svg');

        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    },
};
