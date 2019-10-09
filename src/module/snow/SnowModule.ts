import { App, Module } from '@/App';
import defaults from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import Snow from '@/module/snow/pixi-snow/Snow';
import SnowPlayer from '@/module/snow/SnowPlayer';
import debounce from 'lodash/debounce';

export default class SnowModule implements Module {
    name = 'Snow';

    player?: SnowPlayer;

    number = defaults.SNOW_NUMBER;

    constructor(readonly app: App) {
        app.on('configReady', (config: Config) => {
                const snowConfig = config.snow || {};
                const enabled = snowConfig.enabled === undefined ? defaults.SNOW_ENABLED : snowConfig.enabled;

                this.number = snowConfig.number || this.number;

                if (enabled) this.setup();
            })
            .on('config:snow.enabled', (enabled: boolean) => {
                if (enabled) app.mka.enablePlayer('snow');
                else app.mka.disablePlayer('snow');
            })
            .on(
                'config:snow.number',
                debounce((value: number) => {
                    this.number = value;

                    this.player && (this.player.number = value);
                }, 200),
            );
    }

    private setup() {
        if (!this.player) {
            this.player = new SnowPlayer();
            this.player.number = this.number;

            this.app.mka.addPlayer('snow', this.player, true);
        }
    }
}
