import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import { init as initGLMW } from 'glmw';

Vue.config.productionTip = false;

async function initApp(vueApp) {
    try {
        await initGLMW();
        const app = new App(vueApp);
    } catch (e) {
        // TODO: Show friendly error message
        console.error(e);
    }
}

new Vue({
    render(h) {
        const vueApp = h(VueApp);

        initApp(vueApp).then();

        return vueApp;
    },
}).$mount('#app');
