import Player from '@/core/mka/Player';
import snowflake from '@/img/snowflake.png';
import Snow from '@/module/snow/pixi-snow/Snow';

export interface Loader {
    on(event: 'error', fn: (e: any, loader: Loader, resources: any) => void): this;
}

const TAG = 'SnowPlayer';

export default class SnowPlayer extends Player {
    snow = new Snow(snowflake, undefined, undefined, 1000);

    attach() {
        const pixiApp = this.mka!.pixiApp;
        this.snow.resize(pixiApp.renderer.width, pixiApp.renderer.height);
        pixiApp.stage.addChild(this.snow);
    }

    detach() {
        if (this.snow) {
            this.snow.destroy();
            this.snow.parent.removeChild(this.snow);
        }
    }

    update(): boolean {
        if (this.snow) {
            // TODO: calculate dt and now
            this.snow.update(16, performance.now());

            return true;
        }
        return false;
    }

    destroy() {
        this.snow && this.snow.destroy();
    }
}
