import VueApp from '@/VueApp.vue';
import { VueConstructor } from 'vue';

export interface Module {
    install(app: App): void;
}

export class App {
    vueApp: VueApp;

    constructor(vueApp: VueApp) {
        this.vueApp = vueApp;
    }

    use(module: Module) {
        module.install(this);
    }

    addComponent(componentClass: VueConstructor) {
        this.vueApp.$options.methods!.addChild.call(this.vueApp, componentClass);
    }
}
