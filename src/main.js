import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import Modules from './module';

Vue.config.productionTip = false;

new Vue({
    render: h => h(VueApp, { ref: 'vueApp' }),
    mounted() {
        const app = new App(/** @type {VueApp} */ this.$refs.vueApp);

        Modules.forEach(Module => app.use(new Module()));
    },
}).$mount('#app');
