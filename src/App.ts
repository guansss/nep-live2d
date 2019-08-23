import Mka from '@/core/mka/Mka';
import VueApp from '@/VueApp.vue';
import { VueConstructor } from 'vue';

export interface Module {
    name: string;

    install(app: App): void;
}

export class App {
    readonly mka: Mka;
    readonly vueApp: VueApp;

    readonly modules: { [name: string]: Module } = {};

    constructor(vueApp: VueApp) {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.mka = new Mka(canvas);

        // TODO: Remove this in release
        eval('window.mka = this.mka');

        this.vueApp = vueApp;
    }

    use(module: Module) {
        this.modules[module.name] = module;
        module.install(this);
    }

    addComponent(componentClass: VueConstructor) {
        this.vueApp.$options.methods!.addChild.call(this.vueApp, componentClass);
    }
}
