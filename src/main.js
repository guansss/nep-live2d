import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import Modules from './module';

Vue.config.productionTip = false;

new Vue({
    render(h) {
        const vueApp = h(VueApp);

        const app = new App(vueApp);
        Modules.forEach(Module => app.use(new Module()));

        return vueApp;
    },
}).$mount('#app');
