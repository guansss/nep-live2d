import Player from '@/core/mka/Player';
import { logger } from '@/core/utils/log';
import autobind from 'autobind-decorator';

const log = logger('Mka');

export default class Mka {
    /**
     * Stores all players by names.
     */
    private players: { [name: string]: Player } = {};

    private lastUpdated = performance.now();

    /**
     * ID returned by `requestAnimationFrame()`
     */
    private rafId = 0;

    constructor(element: HTMLElement) {
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
            log(`Player "${name}" already exists, ignored.`);
            return;
        }

        log(`Add player "${name}"`);
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
            log(`Destroying player "${name}"...`);

            // don't break the loop when error occurs
            try {
                player.destroy();
            } catch (e) {
                log.error(e.message, e.stack);
            }
        });
    }
}
