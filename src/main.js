import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';

Vue.config.productionTip = false;

new Vue({
    render(h) {
        const vueApp = h(VueApp);
        new App(vueApp);

        return vueApp;
    },
}).$mount('#app');
