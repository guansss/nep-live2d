import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import SoundManager from '@/module/live2d-motion/SoundManager';
import SubtitleManager from '@/module/live2d-motion/SubtitleManager';
import VueLive2DMotion from '@/module/live2d-motion/VueLive2DMotion.vue';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { ModelConfig } from '@/module/live2d/ModelConfig';
import { EventEmitter } from '@pixi/utils';

/**
 * Enhances Live2D motion by sounds and subtitles.
 */
export default class Live2DMotionModule implements Module {
    name = 'Live2DMotion';

    config?: Config;

    soundManager = new SoundManager();
    subtitleManager = new SubtitleManager();

    originalVolume = 0;

    constructor(readonly app: App) {
        const live2dModule = app.modules['Live2D'] as Live2DModule;

        if (!live2dModule) return;

        app.on('config:volume', (volume: number) => (this.soundManager.volume = volume))
            .on('config:locale', (locale: string) => (this.subtitleManager.defaultLocale = locale))
            .on('live2dLoaded', (id: number, sprite: Live2DSprite) => this.processSprite(sprite))
            .on('configReady', (config: Config) => {
                this.config = config;
                app.emit('config', 'volume', this.soundManager.volume, true);
            })
            .on('pause', () => {
                // lower the volume in background
                this.originalVolume = this.soundManager.volume;
                this.soundManager.volume *= 0.3;
            })
            .on('resume', () => (this.soundManager.volume = this.originalVolume));

        app.addComponent(VueLive2DMotion, { module: () => this }).then();
    }

    processSprite(sprite: Live2DSprite) {
        const subtitleFile = sprite.model.modelSettings.subtitle;

        if (subtitleFile) {
            this.subtitleManager.loadSubtitle(subtitleFile).then(languages => {
                languages && this.app.emit('live2dSubtitleLoaded', sprite.id, languages);
            });
        }

        (sprite as EventEmitter).on('motion', async (group: string, index: number) => {
            const motionDefinition = sprite.model.modelSettings.motions[group][index];

            let audioPromise: Promise<void> | undefined;

            if (motionDefinition.sound) {
                audioPromise = this.soundManager.playSound(motionDefinition.sound);
            }

            if (subtitleFile && motionDefinition.subtitle) {
                const modelConfig =
                    this.config &&
                    this.config.get<ModelConfig[]>('live2d.models', []).find(model => model.id === sprite.id);
                const locale = modelConfig && modelConfig.locale;

                this.subtitleManager.showSubtitle(subtitleFile, motionDefinition.subtitle, locale, audioPromise).then();
            }
        });
    }
}
