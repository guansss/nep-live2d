import { App, Module } from '@/App';
import Live2DModule from '@/module/live2d';
import { SoundManager } from '@/module/live2d-motion/sound';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { DisplayObject } from '@pixi/display';
import { EventEmitter } from '@pixi/utils';

/**
 * Enhances Live2D motion by sounds and subtitles.
 */
export default class Live2DMotionModule implements Module {
    name = 'Live2DMotion';

    install(app: App) {
        const live2dModule = app.modules['Live2D'];

        if (!(live2dModule && live2dModule instanceof Live2DModule)) return;

        live2dModule.player.container.on('childAdded', (obj: DisplayObject) => {
            if (obj instanceof Live2DSprite) {
                processSprite(obj);
            }
        });
    }
}

function processSprite(sprite: Live2DSprite) {
    (sprite as EventEmitter).on('motion', async (group: string, index: number) => {
        const motionDefinition = sprite.model.modelSettings.motions[group][index];

        if (motionDefinition.sound) {
            await SoundManager.playSound(motionDefinition.sound);
        }
    });
}
