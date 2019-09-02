import Vue from 'vue';
import { App } from '../src/App';
import VueApp from '../src/VueApp';

export async function createApp() {
    return new Promise(resolve => {
        new Vue({
            render: h => h(VueApp, { ref: 'vueApp' }),
            mounted() {
                const app = new App(/** @type {VueApp} */ this.$refs.vueApp);

                resolve(app);
            },
        }).$mount('#app');
    });
}
