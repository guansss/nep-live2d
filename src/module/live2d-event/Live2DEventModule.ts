import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import greet from '@/module/live2d-event/greeting-event';
import registerHitEvent from '@/module/live2d-event/hit-event';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { DisplayObject } from '@pixi/display';

export default class Live2DEventModule implements Module {
    name = 'Live2DEvent';

    config?: Config;

    constructor(app: App) {
        const live2dModule = app.modules['Live2D'];

        if (!(live2dModule && live2dModule instanceof Live2DModule)) return;

        live2dModule.player.container.on('childAdded', (obj: DisplayObject) => {
            if (obj instanceof Live2DSprite) {
                this.processSprite(obj);
            }
        });

        app.on('configReady', (config: Config) => {
            this.config = config;
            app.emit('config', 'live2d.greet', true, true);
        });
    }

    processSprite(sprite: Live2DSprite) {
        registerHitEvent(sprite);

        if (this.config && this.config.get('live2d.greet', false)) {
            greet(sprite);
        }
    }
}
