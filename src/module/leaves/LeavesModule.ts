import { App, Module } from '@/App';
import { HIGH_QUALITY, LEAVES_DROP_RATE, LEAVES_NUMBER } from '@/defaults';
import LeavesPlayer from '@/module/leaves/LeavesPlayer';
import { Renderer } from '@pixi/core';
import { Loader } from '@pixi/loaders';
import { ParticleRenderer } from '@pixi/particles';
import { SpritesheetLoader } from '@pixi/spritesheet';
import debounce from 'lodash/debounce';

Renderer.registerPlugin('particle', ParticleRenderer as any);
Loader.registerPlugin(SpritesheetLoader);

export interface Config {
    leaves: {
        enabled?: boolean;
        number?: number;
    };
}

export default class LeavesModule implements Module {
    name = 'Leaves';

    player?: LeavesPlayer;

    number = LEAVES_NUMBER;
    dropRate = LEAVES_NUMBER;
    highQuality = HIGH_QUALITY;

    constructor(readonly app: App) {
        app.on('config:leaves.on', (enabled: boolean) => {
                if (enabled) this.setup();

                if (enabled) app.mka.enablePlayer('leaves');
                else app.mka.disablePlayer('leaves');
            })
            .on(
                'config:leaves.number',
                debounce((value: number) => {
                    this.number = value;
                    this.player && (this.player.number = value);
                }, 200),
            )
            .on('config:leaves.rate', (value: number) => {
                this.dropRate = value;
                this.player && (this.player.dropRate = value);
            })
            .on('config:hq', (highQuality: boolean) => {
                this.highQuality = highQuality;
                this.player && (this.player.layering = highQuality);
            })
            .on('configReady', (config: Config) => {
                app.emit('config', 'leaves.on', false, true);
                app.emit('config', 'leaves.number', this.number, true);
                app.emit('config', 'leaves.rate', LEAVES_DROP_RATE, true);
            });
    }

    private setup() {
        if (!this.player) {
            this.player = new LeavesPlayer();
            this.player.number = this.number;
            this.player.dropRate = this.dropRate;
            this.player.layering = this.highQuality;

            this.app.mka.addPlayer('leaves', this.player);
        }
    }
}
