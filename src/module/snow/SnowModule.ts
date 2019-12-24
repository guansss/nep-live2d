import { App, Module } from '@/App';
import { SNOW_NUMBER } from '@/defaults';
import { Config } from '@/module/config/ConfigModule';
import Snow from '@/module/snow/pixi-snow/Snow';
import SnowPlayer from '@/module/snow/SnowPlayer';
import debounce from 'lodash/debounce';

export default class SnowModule implements Module {
    name = 'Snow';

    player?: SnowPlayer;

    number = SNOW_NUMBER;

    constructor(readonly app: App) {
        app.on('config:snow.on', (enabled: boolean) => {
                if (enabled) this.setup();

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
                app.emit('config', 'snow.on', false, true);
                app.emit('config', 'snow.number', this.number, true);
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
