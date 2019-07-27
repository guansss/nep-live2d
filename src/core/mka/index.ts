import Player from '@/core/mka/Player';
import { error, log, Tagged } from '@/core/utils/log';
import { Application as PIXIApplication } from '@pixi/app';
import autobind from 'autobind-decorator';

export default class Mka implements Tagged {
    tag = Mka.name;

    readonly pixiApp: PIXIApplication;

    /**
     * Stores all players by names.
     */
    private readonly players: { [name: string]: Player } = {};

    private lastUpdated = performance.now();

    /**
     * ID returned by `requestAnimationFrame()`
     */
    private rafId = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.pixiApp = new PIXIApplication();

        this.rafId = requestAnimationFrame(this.tick);
    }

    @autobind
    private tick(now: number) {
        const delta = now - this.lastUpdated;

        for (const player of Object.values(this.players)) {
            if (player.enabled && !player.paused) {
                player.update(delta);
            }
        }

        this.lastUpdated = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
    }

    addPlayer(name: string, player: Player) {
        if (this.players[name]) {
            log(this, `Player "${name}" already exists, ignored.`);
            return;
        }

        log(this, `Add player "${name}"`);
        this.players[name] = player;
    }

    getPlayer(name: string) {
        return this.players[name];
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
