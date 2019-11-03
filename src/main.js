import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import Modules from './module';
import VueI18n from 'vue-i18n';

Vue.config.productionTip = false;

Vue.use(VueI18n);

const i18n = new VueI18n({
    fallbackLocale: 'en-us',
    silentFallbackWarn: true,
    messages: process.env.I18N,
});

document.getElementById('message').remove();

function startup() {
    const mainApp = new Vue({
        i18n,

        render: h => h(VueApp, { ref: 'vueApp' }),

        mounted() {
            const app = new App(/** @type {VueApp} */ this.$refs.vueApp);

            // completely reset!
            app.once('reset', () => {
                app.destroy();
                mainApp.$destroy();
                localStorage.clear();

                startup();
            });

            Modules.forEach(Module => app.use(Module));

            if (!document.getElementById('custom')) {
                const script = document.createElement('script');
                script.id = 'custom';
                script.src = 'custom.js';
                script.onload = () => {
                    if (window.setup && !app.destroyed) {
                        window.setup(app);
                    }
                };

                document.head.appendChild(script);
            } else {
                window.setup && window.setup(app);
            }
        },
    }).$mount('#app');
}

startup();
