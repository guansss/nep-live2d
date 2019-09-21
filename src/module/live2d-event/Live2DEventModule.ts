import { App, Module } from '@/App';
import registerHitEvent from '@/module/live2d-event/hit-event';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { DisplayObject } from '@pixi/display';

export default class Live2DEventModule implements Module {
    name = 'Live2DEvent';

    sprites: Live2DSprite[] = [];

    constructor(app: App) {
        const live2dModule = app.modules['Live2D'];

        if (!(live2dModule && live2dModule instanceof Live2DModule)) return;

        live2dModule.player.container.on('childAdded', (obj: DisplayObject) => {
            if (obj instanceof Live2DSprite) {
                this.processSprite(obj);
            }
        });
        live2dModule.player.container.on('childRemoved', (obj: DisplayObject) => {
            const index = (this.sprites as DisplayObject[]).indexOf(obj);

            if (index >= 0) {
                this.sprites.splice(index, 1);
            }
        });
    }

    processSprite(sprite: Live2DSprite) {
        this.sprites.push(sprite);

        registerHitEvent(sprite);
    }
}
