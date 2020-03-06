import Player, { InternalPlayer } from '@/core/mka/Player';
import Ticker from '@/core/mka/Ticker';
import { error, log } from '@/core/utils/log';
import { Application as PIXIApplication } from '@pixi/app';
import { BatchRenderer, Renderer } from '@pixi/core';
import autobind from 'autobind-decorator';

Renderer.registerPlugin('batch', BatchRenderer as any);

const TAG = 'Mka';

export default class Mka {
    private _paused = false;

    get paused() {
        return this._paused;
    }

    readonly pixiApp: PIXIApplication;

    get gl() {
        // @ts-ignore
        return this.pixiApp.renderer.gl;
    }

    private readonly players: { [name: string]: InternalPlayer } = {};

    /**
     * ID returned by `requestAnimationFrame()`
     */
    private rafId = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.pixiApp = new PIXIApplication({
            view: canvas,
            resizeTo: canvas,
            transparent: true,
        });

        this.pixiApp.stage.sortableChildren = true;

        this.rafId = requestAnimationFrame(this.tick);
    }

    addPlayer(name: string, player: Player, enabled = true) {
        if (this.players[name]) {
            log(TAG, `Player "${name}" already exists, ignored.`);
            return;
        }

        log(TAG, `Add player "${name}"`);
        this.players[name] = player;
        this.players[name].mka = this;
        player.attach();

        if (enabled) {
            this.enablePlayer(name);
        }
    }

    getPlayer(name: string) {
        return this.players[name] as Player;
    }

    enablePlayer(name: string) {
        const player = this.players[name];

        if (player && !player.enabled) {
            player.enabled = true;
            player.enable();
        }
    }

    disablePlayer(name: string) {
        const player = this.players[name];

        if (player && player.enabled) {
            player.enabled = false;
            player.disable();
        }
    }

    @autobind
    private tick(now: DOMHighResTimeStamp) {
        if (!this._paused) {
            if (Ticker.tick(now)) {
                this.forEachPlayer(player => {
                    if (player.enabled && !player.paused) {
                        player.update();
                    }
                });

                this.pixiApp.render();
            }
            this.rafId = requestAnimationFrame(this.tick);
        }
    }

    pause() {
        this._paused = true;
        cancelAnimationFrame(this.rafId);

        Ticker.pause();

        this.forEachPlayer(player => {
            if (player.enabled) {
                player.paused = true;
                player.pause();
            }
        });
    }

    resume() {
        this._paused = false;

        // postpone the resuming to prevent discrepancy of timestamp (https://stackoverflow.com/a/38360320)
        // note that we must wrap it with two rAF here, because in WE, the first rAF will possibly be invoked with
        //  timestamp of the animation frame that is right after the pausing frame, and thus the Ticker.timeSincePause
        //  will be broken.
        this.rafId = requestAnimationFrame(() => {
            this.rafId = requestAnimationFrame(now => {
                Ticker.resume(now);

                this.forEachPlayer(player => {
                    if (player.enabled) {
                        player.paused = false;
                        player.resume();
                    }
                });

                this.tick(now);
            });
        });
    }

    forEachPlayer(fn: (player: InternalPlayer, name: string) => void) {
        for (const [name, player] of Object.entries(this.players)) {
            try {
                fn(player, name);
            } catch (e) {
                error(TAG, `(${name})`, e);
            }
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        Object.entries(this.players).forEach(([name, player]) => {
            log(TAG, `Destroying player "${name}"...`);

            // don't break the loop when error occurs
            try {
                player.destroy();
            } catch (e) {
                error(TAG, e.message, e.stack);
            }
        });

        this.pixiApp.destroy();
    }
}
