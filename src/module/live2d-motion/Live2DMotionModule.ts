import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import SoundManager from '@/module/live2d-motion/SoundManager';
import SubtitleManager from '@/module/live2d-motion/SubtitleManager';
import VueLive2DMotionClass from '@/module/live2d-motion/VueLive2DMotion.ts';
import VueLive2DMotion from '@/module/live2d-motion/VueLive2DMotion.vue';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { DisplayObject } from '@pixi/display';
import { EventEmitter } from '@pixi/utils';

/**
 * Enhances Live2D motion by sounds and subtitles.
 */
export default class Live2DMotionModule implements Module {
    name = 'Live2DMotion';

    soundManager = new SoundManager();
    subtitleManager!: SubtitleManager;

    constructor(app: App) {
        const live2dModule = app.modules['Live2D'];

        if (!(live2dModule instanceof Live2DModule)) return;

        app.addComponent(VueLive2DMotion).then(component => {
            const vueLive2DMotion = component as VueLive2DMotionClass;

            this.subtitleManager = new SubtitleManager(vueLive2DMotion.subtitles);

            live2dModule.player.container.on('childAdded', (obj: DisplayObject) => {
                if (obj instanceof Live2DSprite) {
                    this.processSprite(obj);
                }
            });
        });

        app.on('configInit', (config: Config) => {
            if (config.volume) {
                this.soundManager.volume = config.volume;
            }
        });
        app.on('config:volume', (path: string, value: number) => {
            this.soundManager.volume = value;
        });
    }

    processSprite(sprite: Live2DSprite) {
        this.subtitleManager.loadSubtitle(sprite.model).then();

        (sprite as EventEmitter).on('motion', async (group: string, index: number) => {
            const motionDefinition = sprite.model.modelSettings.motions[group][index];

            let audio: HTMLAudioElement | undefined;

            if (motionDefinition.sound) {
                audio = this.soundManager.playSound(motionDefinition.sound);
            }

            if (motionDefinition.subtitle) {
                const timingPromise: Promise<any> | undefined =
                    audio && new Promise(resolve => audio!.addEventListener('ended', resolve));

                this.subtitleManager.showSubtitle(sprite.model, motionDefinition.subtitle, timingPromise);
            }
        });
    }
}
