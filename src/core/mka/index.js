import { logger } from '@/utils/log';

const log = logger('Mka');

export default class Mka {
    /**
     * Stores all players with names
     * @type {Object<string, Player>}
     * @private
     */
    _players = {};

    /**
     * Timestamp of last update
     * @type {number}
     * @private
     */
    _lastUpdated = 0;

    constructor(element) {}

    /**
     * @param {string} name
     * @param {Player} player
     */
    addPlayer(name, player) {
        if (this._players[name]) {
            log(`Player "${name}" already exists, ignored.`);
            return;
        }

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
        Object.entries(this._players).forEach(([name, player]) => {
            log(`Destroying player "${name}"...`);
            player.destroy();
        });
    }
}
