import Player, { InternalPlayer } from '@/core/mka/Player';
import Ticker from '@/core/mka/Ticker';
import { error, log } from '@/core/utils/log';
import { Application as PIXIApplication } from '@pixi/app';
import autobind from 'autobind-decorator';

const TAG = 'Mka';

export default class Mka {
    static ticker = new Ticker();

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
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            transparent: true,
        });

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
            if (Mka.ticker.tick(now)) {
                this.forEachPlayer(player => {
                    if (player.enabled && !player.paused) {
                        player.update(Mka.ticker);
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

        this.forEachPlayer(player => {
            if (player.enabled) {
                player.paused = true;
                player.pause();
            }
        });
    }

    resume() {
        this._paused = false;

        this.forEachPlayer(player => {
            if (player.enabled) {
                player.paused = false;
                player.resume();
            }
        });

        requestAnimationFrame(this.tick);
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
