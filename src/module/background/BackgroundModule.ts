import { App, Module } from '@/App';
import { nop } from '@/core/utils/misc';
import Background from '@/module/background/Background.vue';

export interface Config {
    bg?: {
        src: string;
        volume?: number;
        fill?: boolean;
    };
}

export function isVideo(src: string) {
    // only webm ang ogv can be accepted in Wallpaper Engine, mp4 is added for test purpose
    // see https://steamcommunity.com/app/431960/discussions/2/1644304412672544283/
    return /(mp4|webm|ogv)$/.test(src);
}

export default class BackgroundModule implements Module {
    name = 'Background';

    componentPromise?: Promise<any>;

    src = '';
    fill = false;
    volume = 0;

    constructor(readonly app: App) {
        app.on('config:bg.fill', this.setFill, this)
            .on('config:bg.volume', this.setVolume, this)
            .on('config:bg.src', this.setBackground, this)
            .on('configReady', (config: Config) => {
                if (config.bg) {
                    this.setVolume(config.bg.volume).then();
                    this.setFill(!!config.bg.fill).then();
                    this.setBackground(config.bg.src).then();
                }
            });

        document.body.style.transition = 'background .2s';
    }

    async setBackground(src: string) {
        this.src = src;

        if (isVideo(src)) {
            if (!this.componentPromise) {
                this.componentPromise = this.app.addComponent(Background, { module: () => this });
            }

            await this.componentPromise;
            this.applyVideo(src);
            this.applyVolume(this.volume);
            this.fillVideo(this.fill);
        } else {
            document.body.style.backgroundImage = `url("${src}")`;

            if (this.componentPromise) {
                // clear the video background
                await this.componentPromise;
                this.applyVideo();
            }
        }
    }

    async setFill(fill: boolean) {
        this.fill = fill;

        if (isVideo(this.src)) {
            if (this.componentPromise) {
                await this.componentPromise;
                this.fillVideo(this.fill);
            }
        } else {
            document.body.style.backgroundSize = fill ? '100% 100%' : 'cover';
        }
    }

    async setVolume(volume?: number) {
        this.volume = volume || 0;

        if (isVideo(this.src) && this.componentPromise) {
            await this.componentPromise;
            this.applyVolume(this.volume);
        }
    }

    /** @abstract */
    applyVideo: (src?: string) => void = nop;

    /** @abstract */
    applyVolume: (volume: number) => void = nop;

    /** @abstract */
    fillVideo: (fill: boolean) => void = nop;
}
