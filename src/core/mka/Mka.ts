import Player, { InternalPlayer } from '@/core/mka/Player';
import { error, log, Tagged } from '@/core/utils/log';
import { Application as PIXIApplication } from '@pixi/app';
import autobind from 'autobind-decorator';

export default class Mka implements Tagged {
    tag = Mka.name;

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

    private lastUpdated = performance.now();

    /**
     * ID returned by `requestAnimationFrame()`
     */
    private rafId = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.pixiApp = new PIXIApplication({
            view: canvas,
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
        });

        this.rafId = requestAnimationFrame(this.tick);
    }

    addPlayer(name: string, player: Player) {
        if (this.players[name]) {
            log(this, `Player "${name}" already exists, ignored.`);
            return;
        }

        log(this, `Add player "${name}"`);
        this.players[name] = player;
        this.players[name].mka = this;
        player.attach();
    }

    getPlayer(name: string) {
        return this.players[name];
    }

    @autobind
    private tick(now: number) {
        if (!this._paused) {
            const delta = now - this.lastUpdated;

            this.forEachPlayer(player => {
                if (player.enabled && !player.paused) {
                    player.update();
                }
            });

            this.pixiApp.render();

            this.lastUpdated = performance.now();
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
                error(this, `(${name})`, e);
            }
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        Object.entries(this.players).forEach(([name, player]) => {
            log(this, `Destroying player "${name}"...`);

            // don't break the loop when error occurs
            try {
                player.destroy();
            } catch (e) {
                error(this, e.message, e.stack);
            }
        });
    }
}
