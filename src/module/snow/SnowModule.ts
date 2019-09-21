import { App, Module } from '@/App';
import { Config } from '@/module/config/ConfigModule';
import SnowPlayer from '@/module/snow/SnowPlayer';
import debounce from 'lodash/debounce';

export default class SnowModule implements Module {
    name = 'Snow';

    constructor(app: App) {
        const player = new SnowPlayer();
        app.mka.addPlayer('snow', player);

        app.on('configInit', (config: Config) => {
            if (config.snow) {
                player.snow.number = config.snow.number;
            }
        });
        app.on(
            'config:snow.number',
            debounce((value: number) => {
                player.snow.number = value;
            }, 200),
        );
    }
}
