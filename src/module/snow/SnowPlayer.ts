import snowflake from '@/assets/img/snowflake.png';
import Player from '@/core/mka/Player';
import Ticker from '@/core/mka/Ticker';
import { Z_INDEX_SNOW, Z_INDEX_SNOW_BACK } from '@/defaults';
import Snow, { DEFAULT_OPTIONS } from '@/module/snow/pixi-snow/Snow';

const TAG = 'SnowPlayer';

const MAX_SIZE = 1;
const MIDDLE_SIZE = 0.4;
const MIN_SIZE = 0.1;

export default class SnowPlayer extends Player {
    private snow?: Snow;
    private backSnow?: Snow;

    private _number = DEFAULT_OPTIONS.number;
    private _layering = false;

    get number() {
        return this._number;
    }

    set number(value: number) {
        this._number = value;
        this.snow && (this.snow.number = value);
    }

    get layering() {
        return this._layering;
    }

    set layering(value: boolean) {
        this._layering = value;
        this.setup();
    }

    private setup() {
        if (!this.enabled) return;

        if (!this.snow) {
            this.snow = this.createSnow(MIN_SIZE, MAX_SIZE, this._number);
            this.snow.zIndex = Z_INDEX_SNOW;
        }

        if (this._layering) {
            this.snow.number = ~~(this._number / 2);

            if (!this.backSnow) {
                this.backSnow = this.createSnow(MIN_SIZE, MIDDLE_SIZE, this.snow.number);
                this.backSnow.zIndex = Z_INDEX_SNOW_BACK;

                // reset the size
                this.snow.options.minSize = MIDDLE_SIZE;
                this.snow.options.maxSize = MAX_SIZE;
                this.snow.setup();
            }
        } else {
            this.snow.number = this._number;

            if (this.backSnow) {
                this.destroySnow(this.backSnow);
                this.backSnow = undefined;

                // reset the size
                this.snow.options.minSize = MIN_SIZE;
                this.snow.options.maxSize = MAX_SIZE;
                this.snow.setup();
            }
        }

        if (this.mka) {
            const pixiApp = this.mka.pixiApp;

            const width = pixiApp.renderer.width;
            const height = pixiApp.renderer.height;

            if (width !== this.snow.width || height !== this.snow.height) {
                this.snow.resize(width, height);
            }

            if (!pixiApp.stage.children.includes(this.snow)) {
                pixiApp.stage.addChild(this.snow);
            }

            if (this.backSnow) {
                if (width !== this.backSnow.width || height !== this.backSnow.height) {
                    this.backSnow.resize(width, height);
                }

                if (!pixiApp.stage.children.includes(this.backSnow)) {
                    pixiApp.stage.addChild(this.backSnow);
                }
            }
        }
    }

    private createSnow(minSize: number, maxSize: number, number: number): Snow {
        let width = 100;
        let height = 100;

        if (this.mka) {
            const renderer = this.mka.pixiApp.renderer;
            width = renderer.width;
            height = renderer.height;
        }

        return new Snow(snowflake, { width, height, minSize, maxSize, number });
    }

    private destroySnow(snow: Snow) {
        if (this.mka && this.mka.pixiApp.stage.children.includes(snow)) {
            this.mka.pixiApp.stage.removeChild(snow);
        }

        snow.destroy();
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
        let updated = false;

        if (this.snow) {
            this.snow.update(Ticker.delta, Ticker.now);

            updated = true;
        }

        if (this.backSnow) {
            this.backSnow.update(Ticker.delta, Ticker.now);

            updated = true;
        }

        if (updated) {
            Snow.wind.update(Ticker.delta);
        }

        return updated;
    }

    destroy() {
        if (this.snow) {
            this.destroySnow(this.snow);
            this.snow = undefined;
        }

        if (this.backSnow) {
            this.destroySnow(this.backSnow);
            this.backSnow = undefined;
        }
    }
}
