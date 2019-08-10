import Vue from 'vue';
import VueApp from './VueApp';
import { App } from './App';
import { init as initGLMW } from 'glmw';
import Modules from './module';

Vue.config.productionTip = false;

async function initApp(vueApp) {
    try {
        await initGLMW();
        const app = new App(vueApp);
        Modules.forEach(Module => app.use(new Module()));
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
