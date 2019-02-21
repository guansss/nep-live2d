import { logger } from '@/utils/log';

const log = logger('Mka');

export default class Mka {
    /**
     * Stores all players with names
     * @private {Object<string, Player>}
     */
    _players = {};

    /**
     * Timestamp of last update
     * @private {number}
     */
    _lastUpdated = 0;

    /**
     * `_tick()` bound with `this`, will be used during every tick, so cache it for efficiency
     * @private {function}
     */
    _boundTick = null;

    /**
     * ID returned by `requestAnimationFrame()`
     * @private {number}
     */
    _rafId = 0;

    constructor(element) {
        this._lastUpdated = performance.now();

        this._boundTick = this._tick.bind(this);
        this._rafId = requestAnimationFrame(this._boundTick);
    }

    _tick() {
        const now = performance.now();
        const delta = now - this._lastUpdated;

        for (const player of Object.values(this._players)) {
            if (player.enabled && !player.paused) {
                player.update(delta);
            }
        }

        this._lastUpdated = performance.now();
        this._rafId = requestAnimationFrame(this._boundTick);
    }

    /**
     * @param {string} name
     * @param {Player} player
     */
    addPlayer(name, player) {
        if (this._players[name]) {
            log(`Player "${name}" already exists, ignored.`);
            return;
        }

        log(`Add player "${name}"`);
        this._players[name] = player;
    }

    /**
     * @param {string} name
     * @returns {Player}
     */
    getPlayer(name) {
        return this._players[name];
    }

    destroy() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }

        Object.entries(this._players).forEach(([name, player]) => {
            log(`Destroying player "${name}"...`);
            player.destroy();
        });
    }
}
