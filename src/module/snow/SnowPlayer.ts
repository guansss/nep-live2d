import snowflake from '@/assets/img/snowflake.png';
import Player from '@/core/mka/Player';
import Ticker from '@/core/mka/Ticker';
import Snow from '@/module/snow/pixi-snow/Snow';

export interface Loader {
    on(event: 'error', fn: (e: any, loader: Loader, resources: any) => void): this;
}

const TAG = 'SnowPlayer';

export default class SnowPlayer extends Player {
    private snow?: Snow;

    private _number = 0;

    get number() {
        return this.snow ? this.snow.number : this._number;
    }

    set number(value: number) {
        this._number = value;
        this.snow && (this.snow.number = value);
    }

    private setup() {
        if (!this.enabled) return;

        if (!this.snow) {
            let width = 100;
            let height = 100;

            if (this.mka) {
                const renderer = this.mka.pixiApp.renderer;
                width = renderer.width;
                height = renderer.height;
            }

            this.snow = new Snow(snowflake, width, height, this._number);
        }

        if (this.mka) {
            const pixiApp = this.mka.pixiApp;
            if (!pixiApp.stage.children.includes(this.snow!)) {
                if (pixiApp.renderer.width !== this.snow.width || pixiApp.renderer.height !== this.snow.height) {
                    this.snow.resize(pixiApp.renderer.width, pixiApp.renderer.height);
                }
                this.mka.pixiApp.stage.addChild(this.snow!);
            }
        }
    }

    attach() {
        this.setup();
    }

    detach() {
        this.destroy();
    }

    enable() {
        this.setup();
    }

    disable() {
        this.destroy();
    }

    update(): boolean {
        if (this.snow) {
            this.snow.update(Ticker.delta, Ticker.now);

            return true;
        }
        return false;
    }

    destroy() {
        if (this.snow) {
            if (this.mka && this.mka.pixiApp.stage.children.includes(this.snow!)) {
                this.mka.pixiApp.stage.removeChild(this.snow!);
            }

            this.snow.destroy();
            this.snow = undefined;
        }
    }
}
