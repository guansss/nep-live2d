import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import SoundManager from '@/module/live2d-motion/SoundManager';
import SubtitleManager from '@/module/live2d-motion/SubtitleManager';
import VueLive2DMotion from '@/module/live2d-motion/VueLive2DMotion.vue';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { EventEmitter } from '@pixi/utils';

/**
 * Enhances Live2D motion by sounds and subtitles.
 */
export default class Live2DMotionModule implements Module {
    name = 'Live2DMotion';

    soundManager = new SoundManager();
    subtitleManager = new SubtitleManager();

    constructor(app: App) {
        const live2dModule = app.modules['Live2D'] as Live2DModule;

        if (!live2dModule) return;

        app.on('configReady', (config: Config) => {
                if (config.volume) {
                    this.soundManager.volume = config.volume;
                }
            })
            .on('config:volume', (value: number) => (this.soundManager.volume = value))
            .on('live2dLoaded', (id: number, sprite: Live2DSprite) => this.processSprite(sprite));

        app.emit('config', 'volume', this.soundManager.volume, true);

        app.addComponent(VueLive2DMotion, { module: () => this }).then();
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
                const timingPromise = audio && new Promise(resolve => audio!.addEventListener('ended', resolve));

                this.subtitleManager.showSubtitle(sprite.model, motionDefinition.subtitle, timingPromise);
            }
        });
    }
}
