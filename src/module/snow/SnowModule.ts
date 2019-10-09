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
        app.on('config:snow.enabled', (enabled: boolean) => {
                this.setup();

                if (enabled) app.mka.enablePlayer('snow');
                else app.mka.disablePlayer('snow');
            })
            .on(
                'config:snow.number',
                debounce((value: number) => {
                    this.number = value;

                    this.player && (this.player.number = value);
                }, 200),
            )
            .on('configReady', (config: Config) => {
                const snowConfig = config.snow || {};

                if (snowConfig.number === undefined) {
                    app.emit('config', 'snow.number', defaults.SNOW_NUMBER, true);
                }

                if (snowConfig.enabled === undefined) {
                    app.emit('config', 'snow.enabled', defaults.SNOW_ENABLED, true);
                } else if (snowConfig.enabled) {
                    this.setup();
                }
            });
    }

    private setup() {
        if (!this.player) {
            this.player = new SnowPlayer();
            this.player.number = this.number;

            this.app.mka.addPlayer('snow', this.player);
        }
    }
}
