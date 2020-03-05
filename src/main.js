import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import Modules from './module';
import i18n from '@/plugins/vue-i18n';

Vue.config.productionTip = false;

document.getElementById('message').remove();

function startup() {
    const mainApp = new Vue({
        i18n,

        render: h => h(VueApp, { ref: 'vueApp' }),

        mounted() {
            const app = new App(/** @type {VueApp} */ this.$refs.vueApp);

            app.once('reload', () => {
                mainApp.$destroy();
                app.destroy();
                startup();
            });

            // reload after resetting
            app.once('reset', () => setTimeout(() => app.emit('reload'), 0));

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
