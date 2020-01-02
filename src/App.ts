import Mka from '@/core/mka/Mka';
import Ticker from '@/core/mka/Ticker';
import EventEmitter from '@/core/utils/EventEmitter';
import { error } from '@/core/utils/log';
import { Config } from '@/module/config/ConfigModule';
import VueApp from '@/VueApp.vue';
import { Vue, VueConstructor } from 'vue/types/vue';

export interface ModuleConstructor {
    new(app: App): Module;
}

export interface Module {
    name: string;
}

const TAG = 'App';

export class App extends EventEmitter {
    destroyed = false;

    readonly mka: Mka;

    readonly modules: { [name: string]: Module } = {};

    constructor(readonly vueApp: VueApp) {
        super();

        const canvas = (vueApp as any).canvas as HTMLCanvasElement;
        this.mka = new Mka(canvas);

        this.on('pause', () => this.mka.pause())
            .on('resume', () => this.mka.resume())
            .on('we:schemecolor', (color: string) => {
                const rgb = color
                    .split(' ')
                    .map(float => ~~(parseFloat(float) * 255))
                    .join(',');
                document.documentElement.style.setProperty('--accentColor', `rgb(${rgb})`);
            })
            .on('config:locale', (locale: string) => (vueApp.$i18n.locale = locale))
            .on('config:fpsMax', (maxFPS: number) => Ticker.setMaxFPS(maxFPS))
            .on('configReady', (config: Config) => {
                this.on('we:language', (locale: string) => this.emit('config', 'locale', locale, true));

                this.emit('config', 'fpsMax', Ticker.getMaxFPS(), true);

                this.emit('config', 'hq', HIGH_QUALITY, true);
            });
    }

    use(M: ModuleConstructor) {
        try {
            const module = new M(this);
            this.modules[module.name] = module;
        } catch (e) {
            error(TAG, `Failed to create module ${M.name}`, e);
        }
    }

    async addComponent(componentClass: VueConstructor, props?: any) {
        return (this.vueApp as any).addChild(componentClass, props) as Vue;
    }

    destroy() {
        this.destroyed = true;
        this.emit('destroy');
        this.vueApp.$destroy();
        this.mka.destroy();
    }
}
