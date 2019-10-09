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
            app.on('reset', () => {
                app.destroy();
                mainApp.$destroy();
                localStorage.clear();

                startup();
            });

            Modules.forEach(Module => app.use(Module));
        },
    }).$mount('#app');
}

startup();
