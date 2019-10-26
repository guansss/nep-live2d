import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import Modules from './module';

Vue.config.productionTip = false;

function startup() {
    const mainApp = new Vue({
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
